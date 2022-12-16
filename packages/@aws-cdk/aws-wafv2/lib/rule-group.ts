import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnRuleGroup, CfnWebACL } from './wafv2.generated';
import { Scope } from './web-acl';

/**
 * The type of content in the payload that you are defining in the Content string.
 */
export enum CustomResponseBodyContentType {
  TEXT_PLAIN = 'TEXT_PLAIN',
  HTML = 'TEXT_HTML',
  JSON = 'APPLICATION_JSON',
}

/**
 * The action to perform if a rule matches.
 */
export class RuleAction {
  /**
   * Allow requests.
   */
  public static allow(
    customRequestHandling?: CfnWebACL.CustomRequestHandlingProperty,
  ) {
    const ruleAction: CfnWebACL.RuleActionProperty = {
      allow: { customRequestHandling },
    };
    return ruleAction;
  }

  /**
   * Block requests.
   */
  public static block(customResponse?: CfnWebACL.CustomResponseProperty) {
    const ruleAction: CfnWebACL.RuleActionProperty = {
      block: { customResponse },
    };
    return ruleAction;
  }
  /**
   * Count requests.
   */
  public static count(
    customRequestHandling?: CfnWebACL.CustomRequestHandlingProperty,
  ) {
    const ruleAction: CfnWebACL.RuleActionProperty = {
      count: { customRequestHandling },
    };
    return ruleAction;
  }

  /**
   * Require token, requests without a valid token will be redirected to a CAPTCHA challenge.
   */
  public static captcha(
    customRequestHandling?: CfnWebACL.CustomRequestHandlingProperty,
  ) {
    const ruleAction: CfnWebACL.RuleActionProperty = {
      captcha: { customRequestHandling },
    };
    return ruleAction;
  }

  // CloudFormation does not yet support the Challenge action
}

export interface ManagedRuleGroupProps {
  /**
   * The name of the rule group. You cannot change the name of a rule group after you create it.
   */
  readonly name?: string;
  /**
   * Defines and enables Amazon CloudWatch metrics and web request sample collection.
   *
   * @default CloudWatch metrics will be enabled and sampled requests will be retained.
   */
  readonly visibilityConfig?: CfnWebACL.VisibilityConfigProperty;
  /**
   * Set all rule actions to count.
   */
  readonly overrideToCount?: boolean;
  /**
   * The rules in the referenced rule group whose actions are set to Count. When you exclude a rule, AWS WAF evaluates it exactly
   * as it would if the rule action setting were Count. This is a useful option for testing the rules in a rule group without modifying
   * how they handle your web traffic.
   */
  readonly excludedRules?: CfnWebACL.ExcludedRuleProperty[];
  /**
   * An optional nested statement that narrows the scope of the web requests that are evaluated by the managed rule group.
   * Requests are only evaluated by the rule group if they match the scope-down statement.
   */
  readonly scopeDownStatement?: CfnWebACL.StatementProperty;
  /**
   * The version of the managed rule group to use. If you specify this, the version setting is fixed until you change it.
   * If you don't specify this, AWS WAF uses the vendor's default version, and then keeps the version at the vendor's default
   * when the vendor updates the managed rule group settings.
   */
  readonly version?: string;
  /**
   * Additional information that's used by a managed rule group. Many managed rule groups don't require this.
   */
  readonly managedRuleGroupConfigs?: CfnWebACL.ManagedRuleGroupConfigProperty[];
}

export interface ManagedRuleGroupAWSProps extends ManagedRuleGroupProps {
  /**
   * The name of the managed rule group.
   */
  readonly rule: string;
}

export interface ManagedRuleGroupThirdPartyProps extends ManagedRuleGroupProps {
  /**
   * The name of the managed rule group vendor.
   */
  readonly vendor: string;
  /**
   * The name of the managed rule group.
   */
  readonly ruleName: string;
}

/**
 * Managed rule groups are collections of predefined, ready-to-use rules that AWS and AWS Marketplace sellers write and maintain for you.
 */
export class ManagedRuleGroup {
  /**
   * The Amazon IP reputation list rule group contains rules that are based on Amazon internal threat intelligence.
   * This is useful if you would like to block IP addresses typically associated with bots or other threats.
   * Blocking these IP addresses can help mitigate bots and reduce the risk of a malicious actor discovering a
   * vulnerable application.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html#aws-managed-rule-groups-ip-rep-amazon
   */
  public static ipReputation(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesAmazonIpReputationList',
      ...props,
    });
  }

  /**
   * The Admin protection rule group contains rules that allow you to block external access to exposed administrative pages.
   * This might be useful if you run third-party software or want to reduce the risk of a malicious actor gaining administrative
   * access to your application.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-admin
   */
  public static adminProtection(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesAdminProtectionRuleSet',
      ...props,
    });
  }
  /**
   * The Known bad inputs rule group contains rules to block request patterns that are known to be invalid and are
   * associated with exploitation or discovery of vulnerabilities. This can help reduce the risk of a malicious
   * actor discovering a vulnerable application.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-known-bad-inputs
   */
  public static knownBadInputs(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesKnownBadInputsRuleSet',
      ...props,
    });
  }
  /**
   * The Core rule set (CRS) rule group contains rules that are generally applicable to web applications.
   * This provides protection against exploitation of a wide range of vulnerabilities, including some of
   * the high risk and commonly occurring vulnerabilities described in OWASP publications such as OWASP Top 10.
   *
   * Consider using this rule group for any AWS WAF use case.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-crs
   */
  public static coreRuleSet(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesCommonRuleSet',
      ...props,
    });
  }
  /**
   * The SQL database rule group contains rules to block request patterns associated with exploitation of SQL databases,
   * like SQL injection attacks. This can help prevent remote injection of unauthorized queries.
   *
   * Evaluate this rule group for use if your application interfaces with an SQL database.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-sql-db
   */
  public static sqlInjection(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesSQLiRuleSet',
      ...props,
    });
  }
  /**
   * The Linux operating system rule group contains rules that block request patterns associated with the exploitation of
   * vulnerabilities specific to Linux, including Linux-specific Local File Inclusion (LFI) attacks. This can help prevent
   * attacks that expose file contents or run code for which the attacker should not have had access. You should evaluate
   * this rule group if any part of your application runs on Linux.
   *
   * You should use this rule group in conjunction with the POSIX operating system rule group.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-linux-os
   */
  public static linux(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesLinuxRuleSet',
      ...props,
    });
  }
  /**
   * The POSIX operating system rule group contains rules that block request patterns associated with the
   * exploitation of vulnerabilities specific to POSIX and POSIX-like operating systems,
   * including Local File Inclusion (LFI) attacks. This can help prevent attacks that expose file contents or
   * run code for which the attacker should not have had access. You should evaluate this rule group if
   * any part of your application runs on a POSIX or POSIX-like operating system, including
   * Linux, AIX, HP-UX, macOS, Solaris, FreeBSD, and OpenBSD.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-linux-os
   */
  public static posix(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesUnixRuleSet',
      ...props,
    });
  }
  /**
   * The Windows operating system rule group contains rules that block request patterns associated with the
   * exploitation of vulnerabilities specific to Windows, like remote execution of PowerShell commands.
   * This can help prevent exploitation of vulnerabilities that permit an attacker to run unauthorized
   * commands or run malicious code.
   *
   * Evaluate this rule group if any part of your application runs on a Windows operating system.
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-windows-os
   */
  public static windows(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesWindowsRuleSet',
      ...props,
    });
  }
  /**
   * The WordPress application rule group contains rules that block request patterns associated with the exploitation
   * of vulnerabilities specific to WordPress sites. You should evaluate this rule group if you are running WordPress.
   *
   * This rule group should be used in conjunction with the SQL database and PHP application rule groups.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-wordpress-app
   */
  public static wordpress(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesWordPressRuleSet',
      ...props,
    });
  }
  /**
   * The PHP application rule group contains rules that block request patterns associated with the exploitation of
   * vulnerabilities specific to the use of the PHP programming language, including injection of unsafe PHP functions.
   * This can help prevent exploitation of vulnerabilities that permit an attacker to remotely run code or commands
   * for which they are not authorized. Evaluate this rule group if PHP is installed on any server with which your
   * application interfaces.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-php-app
   */
  public static php(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesPHPRuleSet',
      ...props,
    });
  }
  /**
   * The Anonymous IP list rule group contains rules to block requests from services that permit the obfuscation of viewer
   * identity. These include requests from VPNs, proxies, Tor nodes, and hosting providers. This rule group is useful
   * if you want to filter out viewers that might be trying to hide their identity from your application.
   * Blocking the IP addresses of these services can help mitigate bots and evasion of geographic restrictions.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html#aws-managed-rule-groups-ip-rep-anonymous
   */
  public static anonymousIp(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesAnonymousIpList',
      ...props,
    });
  }
  /**
   * The Bot Control managed rule group provides rules to block and manage requests from bots.
   * Bots can consume excess resources, skew business metrics, cause downtime, and perform malicious activities.
   *
   * You are charged additional fees when you use this managed rule group.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-bot.html
   */
  public static botControl(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesBotControlRuleSet',
      ...props,
    });
  }
  /**
   * The AWS WAF Fraud Control account takeover prevention (ATP) managed rule group provides rules to block,
   * label, and manage requests that might be part of malicious account takeover attempts.
   *
   * To make full use of the capabilities of this rule group, implement the AWS WAF client application integration SDKs.
   * The SDKs enable client session tracking through the use of AWS WAF tokens. When you use the SDKs, you enable this rule group
   * to use client tokens for client session tracking and management. A number of the rules only run if the tokens are available.
   *
   * You are charged additional fees when you use this managed rule group.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-atp.html
   */
  public static accountTakeover(props?: ManagedRuleGroupProps) {
    return this.aws({
      rule: 'AWSManagedRulesATPRuleSet',
      ...props,
    });
  }

  /**
   * TODO
   */
  public static thirdParty(props: ManagedRuleGroupThirdPartyProps): ManagedRuleGroup {
    const overrideAction = props.overrideToCount ? { count: {} } : { none: {} };
    const thirdPartyRuleGroup = {
      name: props.name || `${props.vendor}-${props.ruleName}`,
      statement: {
        managedRuleGroupStatement: {
          vendorName: props.vendor,
          name: props.ruleName,
        },
      },
      visibilityConfig: props.visibilityConfig || {
        cloudWatchMetricsEnabled: true,
        metricName: `WAF-${props.vendor}-${props.ruleName}`,
        sampledRequestsEnabled: true,
      },
      overrideAction: overrideAction,
    };
    return thirdPartyRuleGroup;
  }

  private static aws(props: ManagedRuleGroupAWSProps): ManagedRuleGroup {
    const overrideAction = props.overrideToCount ? { count: {} } : { none: {} };
    const awsManagedRuleGroup = {
      name: props.name || props.rule,
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: props.rule,
          excludedRules: props.excludedRules,
          scopeDownStatement: props.scopeDownStatement,
          managedRuleGroupConfigs: props.managedRuleGroupConfigs,
          version: props.version,
        },
      },
      visibilityConfig: props.visibilityConfig || {
        cloudWatchMetricsEnabled: true,
        metricName: `WAF-${props.rule}`,
        sampledRequestsEnabled: true,
      },
      overrideAction: overrideAction,
    };
    return awsManagedRuleGroup;
  }
}

/**
 * The area within the portion of the web request that you want AWS WAF to search for SearchString.
 */
export enum PositionalConstraint {
  /**
   * The specified part of the web request must include the value of SearchString, but the location doesn't matter.
   */
  CONTAINS = 'CONTAINS',
  /**
   * The specified part of the web request must include the value of SearchString, and SearchString must contain only
   * alphanumeric characters or underscore (A-Z, a-z, 0-9, or _). In addition, SearchString must be a word, which means that both of the following are true:
   *
   * SearchString is at the beginning of the specified part of the web request or is preceded by a character other than
   * an alphanumeric character or underscore (_). Examples include the value of a header and ;BadBot.
   *
   * SearchString is at the end of the specified part of the web request or is followed by a character other than an
   * alphanumeric character or underscore (_), for example, BadBot; and -BadBot;.
   */
  CONTAINS_WORD = 'CONTAINS_WORD',
  /**
   * The value of the specified part of the web request must exactly match the value of SearchString.
   */
  EXACTLY = 'EXACTLY',
  /**
   * The value of SearchString must appear at the beginning of the specified part of the web request.
   */
  STARTS_WITH = 'STARTS_WITH',
  /**
   * The value of SearchString must appear at the end of the specified part of the web request.
   */
  ENDS_WITH = 'ENDS_WITH',
}

/**
 * Setting that indicates how to aggregate the request counts.
 */
export enum AggregateKeyType {
  /**
   * Aggregate the request counts on the IP address from the web request origin.
   */
  IP = 'IP',
  /**
   * Aggregate the request counts on the first IP address in an HTTP header.
   */
  FORWARDED_IP = 'FORWARDED_IP',
}

// rule group: name, description?, cw metric name, rules[], capacity 1-1500. rules prioritized by order.
export interface RuleGroupProps {
  // TODO: make this optional with default to the sum of the rules' capacity
  readonly capacity: number;
  // TODO: customResponseBodies
  // readonly customResponseBodies?: CfnWebACL.CustomResponseBodyProperty[];
  readonly description?: string;
  readonly name?: string;
  readonly rules?: Rule[];
  readonly scope: Scope;
  readonly tags?: core.Tag[];
  // TODO: this should be optional with sane defaults
  readonly visibilityConfig: CfnWebACL.VisibilityConfigProperty;
  // TODO
}
/**
 * Use a RuleGroup to define a collection of rules for inspecting and controlling web requests.
 *
 * When you create a rule group, you define an immutable capacity limit. If you update a rule group, you must stay within the
 * capacity. This allows others to reuse the rule group with confidence in its capacity requirements.
 *
 * @resource AWS::WAFv2::RuleGroup
 */
export class RuleGroup extends core.Resource {
  /**
   * The Amazon Resource Name (ARN) of the rule group.
   *
   * @attribute
   */
  readonly ruleGroupArn: string;
  /**
   * The ID of the rule group.
   *
   * @attribute
   */
  readonly ruleGroupId: string;
  constructor(scope: Construct, id: string, props: RuleGroupProps) {
    super(scope, id);

    const resource = new CfnRuleGroup(this, 'Resource', {
      capacity: props.capacity,
      scope: props.scope,
      // customResponseBodies: props.customResponseBodies,
      visibilityConfig: props.visibilityConfig,
      description: props.description,
      name: props.name,
      rules: props.rules as CfnWebACL.RuleProperty[],
      tags: props.tags,
    });

    this.ruleGroupArn = this.getResourceArnAttribute(resource.attrArn, {
      service: 'wafv2',
      resource: 'rulegroup',
      resourceName: this.physicalName,
    });
    this.ruleGroupId = resource.attrId;
  }
}

/**
 * TODO
 */
export interface RuleProps {
  readonly name: string;
  readonly action: RuleAction;
  readonly matchLogic: MatchLogic;
  readonly statements: Statement[];
  // TODO: make this optional with sane default
  readonly visibilityConfig: CfnWebACL.VisibilityConfigProperty;
  // TODO: make this optional
  readonly captchaConfig: CfnWebACL.CaptchaConfigProperty;
  readonly labels?: any[];
}

/**
 * TODO
 */
export class Rule {
  // TODO: Make sure if you get MatchLogic=MATCH_ONE that you one get one statement
  // TODO: Set the return type of each method to CfnWebACL.RuleProperty, once implemented
  /**
   * TODO
   */
  public static rateBased() {
    // TODO
    return;
  }

  /**
   * TODO
   */
  public static regular() {
    // TODO
    return;
  }
}

/**
 * TODO
 */
export enum MatchLogic {
  MATCH_ONE = 'MATCH_ONE',
  MATCH_ALL = 'MATCH_ALL',
  MATCH_ANY = 'MATCH_ANY',
  MATCH_NONE = 'MATCH_NONE',
}

/**
 * TODO
 */
export class MatchCondition {
  /**
   * TODO
   */
  public stringMatch() {
    return;
  }

  /**
   * TODO
   */
  public stringPatternMatch() {
    return;
  }

  /**
   * TODO
   */
  public sizeMatch() {
    return;
  }

  /**
   * TODO
   */
  public attackMatch() {
    return;
  }
}

/**
 * TODO
 */
export interface InspectSingleHeaderProps extends StatementProps {
  readonly headerFieldName: string;
  readonly matchCondition: MatchCondition;
}

/**
 * TODO
 */
export interface InspectSingleQueryParameterProps extends StatementProps {
  readonly queryArgument: string;
  readonly matchCondition: MatchCondition;
}

/**
 * TODO
 */
export interface InspectURIPathProps extends StatementProps {
  readonly matchCondition: MatchCondition;
}

/**
 * TODO
 */
export interface InspectQueryStringProps extends StatementProps {
  readonly matchCondition: MatchCondition;
}

/**
 * TODO
 */
export interface InspectHTTPMethodProps extends StatementProps {
  readonly matchCondition: MatchCondition;
}

/**
 * TODO
 */
export interface GeoMatchProps extends StatementProps {
  readonly countryCodes: string[]; // TODO: Can we provide an enum for this?
  readonly forwardedIpConfiguration?: ForwardedIPConfiguration;
}

/**
 * TODO
 */
export interface ForwardedIPConfiguration {
  readonly fallbackBehavior: 'MATCH' | 'NO_MATCH'; // TODO: Enum?
  readonly headerName: string;
};

/**
 * TODO
 */
export interface StatementProps {
  readonly negate?: boolean;
  readonly textTransformations?: any[]; // TODO: better type
}

/**
 * TODO
 */
export class Statement {
  /**
   * TODO
   */
  public static geoMatch(props: GeoMatchProps): Statement {
    const geoMatchStatement = {
      GeoMatchStatement: {
        CountryCodes: props.countryCodes,
      },
      ...props.forwardedIpConfiguration,
    };
    return geoMatchStatement;
  }

  /**
   * TODO
   */
  public static ipMatch() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static labelMatch() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectSingleHeader(
    // props: InspectSingleHeaderProps,
  ) {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectAllHeaders() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectCookies() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectSingleQueryParameter(
    // props: InspectSingleQueryParameterProps,
  ) {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectAllQueryParameters() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectURIPath(
    // props: InspectURIPathProps,
  ) {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectQueryString(
    // props: InspectQueryStringProps,
  ) {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectBody() {
    // TODO: specify return type as Statement
    return;
  }

  /**
   * TODO
   */
  public static inspectHTTPMethod(
    // props: InspectHTTPMethodProps,
  ) {
    // TODO: specify return type as Statement
    return;
  }
}
