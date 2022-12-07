import { CfnWebACL } from './wafv2.generated';

/**
 * The action to perform if a rule matches.
 */
export abstract class RuleAction {
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

// TODO: Annotations
export interface ManagedRuleGroupProps {
  readonly name?: string;
  readonly visibilityConfig?: CfnWebACL.VisibilityConfigProperty;
  readonly overrideAction?: RuleAction;
  readonly excludedRules?: CfnWebACL.ExcludedRuleProperty[];
  readonly scopeDownStatement?: CfnWebACL.StatementProperty;
  readonly version?: string;
  readonly managedRuleGroupConfigs?: CfnWebACL.ManagedRuleGroupConfigProperty[];
}

// TODO: Annotations
interface ManagedRuleGroupAWSProps extends ManagedRuleGroupProps {
  readonly rule: string;
}
// TODO: Annotations
interface ManagedRuleGroupThirdPartyProps extends ManagedRuleGroupProps {
  readonly vendor: string;
  readonly ruleName: string;
}

// TODO: Annotations
export abstract class ManagedRuleGroup {
  /**
   * The Amazon IP reputation list rule group contains rules that are based on Amazon internal threat intelligence.
   * This is useful if you would like to block IP addresses typically associated with bots or other threats.
   * Blocking these IP addresses can help mitigate bots and reduce the risk of a malicious actor discovering a
   * vulnerable application.
   *
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html#aws-managed-rule-groups-ip-rep-amazon
   */
  public static IP_REPUTATION(props?: ManagedRuleGroupProps) {
    return this.AWS({
      rule: 'AmazonIpReputationRuleSet',
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
  public static ADMIN_PROTECTION(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static KNOWN_BAD_INPUTS(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static CORE_RULE_SET(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static SQL_INJECTION(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static LINUX(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static POSIX(props?: ManagedRuleGroupProps) {
    return this.AWS({
      rule: 'AWSManagedRulesPosixRuleSet',
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
  public static WINDOWS(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static WORDPRESS(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static PHP(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static ANONYMOUS_IP(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static BOT_CONTROL(props?: ManagedRuleGroupProps) {
    return this.AWS({
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
  public static ACCOUNT_TAKEOVER(props?: ManagedRuleGroupProps) {
    return this.AWS({
      rule: 'AWSManagedRulesATPRuleSet',
      ...props,
    });
  }

  public static ThirdParty(props: ManagedRuleGroupThirdPartyProps) {
    const thirdPartyRule = {
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
      overrideAction: props.overrideAction,
    };
    return thirdPartyRule;
  }

  private static AWS(props: ManagedRuleGroupAWSProps) {
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
      overrideAction: props.overrideAction,
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
export class RuleGroup { }
// rule: name, type(regular or rate-based), action, labels[]?, statementmatcher (one, all/AND, any/OR, doesn't/NOT))
export class Rule { }
// statement: negate?=false. several different types with unique parameters.
export class Statement { }
