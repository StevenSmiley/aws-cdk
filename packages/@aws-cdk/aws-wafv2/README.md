# AWS::WAFv2 Construct Library
<!--BEGIN STABILITY BANNER-->

---

![cfn-resources: Stable](https://img.shields.io/badge/cfn--resources-stable-success.svg?style=for-the-badge)

> All classes with the `Cfn` prefix in this module ([CFN Resources]) are always stable and safe to use.
>
> [CFN Resources]: https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_lib

![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge)

> The APIs of higher level constructs in this module are experimental and under active development.
> They are subject to non-backward compatible changes or removal in any future version. These are
> not subject to the [Semantic Versioning](https://semver.org/) model and breaking changes will be
> announced in the release notes. This means that while you may use them, you may need to update
> your source code when upgrading to a newer version of this package.
---

<!--END STABILITY BANNER-->

The `@aws-cdk/aws-wafv2` package contains constructs for deploying AWS WAF web access control lists (ACLs).

Here is a minimal deployable WebACL definition. You must set the scope for either CloudFront or regional resources.
```ts
const webAcl = new wafv2.WebACL(this, 'WebAcl', {
  scope: wafv2.Scope.REGIONAL,
});
```
## Associate with Resources
A global web ACL can protect Amazon CloudFront distributions, and a regional web ACL can protect Application Load Balancers, Amazon API Gateway APIs, AWS AppSync GraphQL APIs and Amazon Cognito User Pools.

TODO: Seek feedback on RFC: L2 constructs for AppSync are still experimental, can we support them yet?

TODO: Seek feedback on RFC: Is it preferred to use property overrides for association with CloudFront distributions or should we create a method on `cloudfront.distribution` like `addWebAcl`?

To associate with a supported resource, use the `attachTo` method:
```ts
declare const alb: elbv2.ApplicationLoadBalancer;
webAcl.attachTo(alb);
```

Only resources with the same scope of the web ACL can be associated (i.e., CloudFront and regional resources cannot associate to the same web ACL).
## Rules and Rule Groups
A rule defines attack patterns to look for in web requests and the action to take when a request matches the patterns. Rule groups are reusable collections of rules. You can use managed rule groups offered by AWS and AWS Marketplace sellers. You can also write your own rules and use your own rule groups.

Specify rules and rule groups in the web ACL definition. Rules will be automatically prioritized by the order they are provided to the web ACL.

```ts
const webAcl = new wafv2.WebACL(this, 'WebAcl', {
  scope: wafv2.Scope.REGIONAL,
  rules: [firstRule, secondRule, thirdRule],
});
```

### Managed rule groups
`ManagedRuleGroup` supports rule groups managed by AWS and AWS Marketplace vendors, and allows for overriding their default configuration.

```ts
// Accept rule group defaults
export const ruleSqlInjectionRuleSet = wafv2.ManagedRuleGroup.SQL_INJECTION();

// Pin a specific version
export const ruleLinuxRuleSetCount = wafv2.ManagedRuleGroup.LINUX({
  version: 'Version_1.1',
});

// Override default action to COUNT for all rules in the rule group
export const ruleIpReputationRuleSetCount = wafv2.ManagedRuleGroup.IP_REPUTATION({
  overrideToCount: true,
});

// Exclude a rule from a managed rule group
export const ruleCommonRuleSet = wafv2.ManagedRuleGroup.CORE_RULE_SET({
  excludedRules: [{ name: 'SizeRestrictions_BODY' }],
});

// Scope-down rule to only requests that match specific criteria
export const ruleWordpressRuleSetCount = wafv2.ManagedRuleGroup.WORDPRESS({
  scopeDownStatement: {
    matchLogic: wafv2.MatchLogic.MATCH_NONE,
    statements: [
      new wafv2.Statement.GeoMatch(
        countryCodes: ['US']
      ),
    ],
  },
});

// Use rule group managed by a vendor from the AWS Marketplace
// Note: You must first subscribe to this rule group in the AWS Marketplace
export const ruleThirdParty = wafv2.ManagedRuleGroup.ThirdParty({
  vendor: 'MarketplaceSeller',
  ruleName: 'ThirdPartyRules',
});
```

### Custom rule groups
#### Create a custom rule
Use a custom rule to inspect for patterns including query strings, headers, countries, and rate limit violations.
```ts
// Block requests with a header exactly matching a given string
const regularMatchOneRule = new wafv2.Rule.Regular({
  name: 'regularMatchOneRule',
  action: wafv2.RuleAction.block(),
  matchLogic: wafv2.MatchLogic.MATCH_ONE,
  statements: [
    new wafv2.Statement.InspectSingleHeader(
      headerFieldName: 'header',
      matchCondition: wafv2.MatchCondition.StringMatch.Exactly('stringToMatch')
    ),
  ],
});

// Block requests from outside the US that don't come from an expected set of IPs
const regularMatchAllRule = new wafv2.Rule.Regular({
  name: 'regularMatchAllRule',
  action: wafv2.RuleAction.block(),
  matchLogic: wafv2.MatchLogic.MATCH_ALL,
  statements: [
    new wafv2.Statement.GeoMatch(
      negate: true,
      countryCodes: ['US']
    ),
    new wafv2.Statement.IPMatch(
      negate: true,
      ipSets: [overseasOfficeIpSet],
    ),
  ],
});

// Block requests from IPs that exceed 500 requests in five minutes
const rateBasedRule = new wafv2.Rule.RateBased({
  name: 'rateBasedRule',
  maximumRequestsInFiveMinutes: 500,
  action: wafv2.RuleAction.block(),
});

// Allow requests from a given set of IPs
const ipSetRule = new wafv2.Rule.IPSet({
  name: 'rateBasedRule',
  ipSets: [ipSet],
  action: wafv2.RuleAction.allow(),
});
```

#### Create a custom rule group
Use a rule group to combine rules into a single logical set. Rules will be automatically prioritized by the order in which they are given.

```ts
const ruleGroup = new wafv2.RuleGroup(this, 'RuleGroup', {
  scope: wafv2.Scope.REGIONAL,
  rules: [rule1, rule2],
});
```
By default, the rule group capacity will be the sum of its rules, but this can be overriden if you intend to expand the rule group. After you create the rule group, you can't change the capacity.

#### Create a regex pattern set
A regex pattern set provides a collection of regular expressions that you want to use together in a rule statement. You can reference the set when you add a regex pattern set rule statement to a web ACL or rule group. A regex pattern set must contain at least one regex pattern.

If your regex pattern set contains more than one regex pattern, when it's used in a rule, the pattern matching is combined with OR logic. That is, a web request will match the pattern set rule statement if the request component matches any of the patterns in the set.

```ts
const regexPatternSet = new wafv2.RegexPatternSet(this, 'RegexPatternSet',{
  scope: wafv2.Scope.REGIONAL,
  regularExpressionList: [
    'rege(x(es)?|xps?)',
    'colou?r',
  ],
});
```

#### Create an IP Set
An IP set provides a collection of IP addresses and IP address ranges that you want to use together in a rule statement. IP sets are AWS resources.

To use an IP set in a web ACL or rule group, you first create an `IPSet` with your address specifications, then you reference the set when you add an IP set rule statement to a web ACL or rule group.

```ts
const ipSet = new wafv2.IPSet(this, 'IPSet', {
  scope: wafv2.Scope.REGIONAL,
  ipAddressVersion: wafv2.IPAddressVersion.IPV4,
  addresses: [
    '10.0.0.0/32',
  ],
});
```

#### Configure CloudWatch Metrics
By default, each rule will create a CloudWatch metric with a unique name matching the rule name. You can disable the metric for a rule or override the default name. For example, if you want a single metric to measure multiple rules, set the same metric name for each rule.

```ts
// Use the same CloudWatch metric for two rule groups
export const ruleLinuxRuleSetCount = wafv2.ManagedRuleGroup.LINUX({
  metricName: 'AWS-AWSManagedRulesLinuxRuleSet',
});
export const rulePosixRuleSetCount = wafv2.ManagedRuleGroup.POSIX({
  metricName: 'AWS-AWSManagedRulesLinuxRuleSet',
});

// Disable CloudWatch metrics for this rule
export const ruleIpReputationRuleSetCount = wafv2.ManagedRuleGroup.IP_REPUTATION({
  enableCloudWatchMetrics: false,
});
```

### Set the default action for requests that don't match any rules
By default, requests not matching any rules will be allowed without modifying the response. If desired, you can customize this action. 

```ts
// Allow the request and add a custom header. 
// AWS WAF prefixes custom header names with `x-amzn-waf-` when it inserts them.
const webAcl = new wafv2.WebACL(this, 'WebAcl', {
  scope: wafv2.Scope.REGIONAL,
  defaultAction: wafv2.DefaultAction.allow(
    addCustomHeaders: [
      { rule: 'default' },
    ]
  ),
});
```

```ts
// Block the request and send a custom response to the web request.
const webAcl = new wafv2.WebACL(this, 'WebAcl', {
  scope: wafv2.Scope.REGIONAL,
  defaultAction: wafv2.DefaultAction.block(
    responseCode: 418,
    addCustomHeaders: [ {rule: 'default' } ],
    responseBody: {
      contentType: wafv2.CustomResponseBodyContentType.TEXT_PLAIN,
      content: 'I am a teapot.',
    },
  ),
});
```
## Request Sampling
By default, request sampling will be enabled for all rules. Instead, you can exclude rules from sampling or disable request sampling entirely.

With request sampling, you can view a sample of the requests that AWS WAF has inspected and either allowed or blocked. For each sampled request, you can view detailed data about the request, such as the originating IP address and the headers included in the request. You can also view the rules that matched the request, and the rule action settings.

The sample of requests contains up to 100 requests that matched the criteria for a rule in the web ACL and another 100 requests for requests that didn't match any rules and had the web ACL default action applied. The requests in the sample come from all the protected resources that have received requests for your content in the previous three hours.
```ts
// Only sample requests for the first rule
const webAcl = new wafv2.WebACL(this, 'WebAcl', {
  scope: wafv2.Scope.REGIONAL,
  rules: [firstRule, secondRule, thirdRule],
  requestSampling: wafv2.RequestSampling.ENABLE_WITH_EXCEPTIONS(
    enableDefaultActionSampling: true,
    excludedRules: [secondRule, thirdRule],
  ),
});
```

## Logging Web ACL Traffic
You can enable logging to get detailed information about traffic that is analyzed by your web ACL. Logged information includes the time that AWS WAF received a web request from your AWS resource, detailed information about the request, and details about the rules that the request matched. You can send your logs to an Amazon CloudWatch Logs log group, an Amazon Simple Storage Service (Amazon S3) bucket, or an Amazon Kinesis Data Firehose. You can provide an existing log destination or one will be created automatically.

By default, blocked and counted requests are logged and retained for one month. You can optionally customize this to:
- Set a custom retention period
- Configure a filter to specify which web requests are kepts in the logs and which are dropped
- Redact fields

```ts
// Send logs to a new CloudWatch Logs group and override default retention
declare const webAcl: wafv2.WebACL;
webAcl.setLoggingConfiguration({
  logDestinationService: wafv2.LogDestinationService.CLOUDWATCH,
  logSuffix: webAcl.webAclId,
  retentionDays: logs.RetentionDays.ONE_YEAR,
});

// Send logs to an S3 bucket that will persist across deployments, customize filter and redacted fields
let bucket: s3.Bucket;
webAcl.setLoggingConfiguration({
  logDestination: bucket,
  loggingFilter: wafv2.LoggingFilterConfiguration.defaultDrop([
      wafv2.LoggingFilter.keepIfMeetsAny([
        wafv2.LoggingFilterCondition.action(
          wafv2.LoggingFilterActionConditionAction.BLOCK,
        ),
        wafv2.LoggingFilterCondition.action(
          wafv2.LoggingFilterActionConditionAction.COUNT,
        ),
      ]),
    ])
  redactedFields: [{
      singleHeader: { "Name": "haystack" },
    }],
})
```