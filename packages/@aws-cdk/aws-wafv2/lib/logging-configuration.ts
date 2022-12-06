import * as logs from '@aws-cdk/aws-logs';
import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnLoggingConfiguration, CfnRuleGroup } from './wafv2.generated';
import { WebACL } from './web-acl';

export enum LogDestinationService {
  CLOUDWATCH = 'cloudwatch',
  // TODO: Add S3, Kinesis support
}

export enum LoggingFilterBehavior {
  KEEP = 'KEEP',
  DROP = 'DROP',
}

export enum LoggingFilterRequirement {
  MEETS_ANY = 'MEETS_ANY',
  MEETS_ALL = 'MEETS_ALL',
}

export enum LoggingFilterActionConditionAction {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  COUNT = 'COUNT',
  CAPTCHA = 'CAPTCHA',
  CHALLENGE = 'CHALLENGE',
  EXCLUDED_AS_COUNT = 'EXCLUDED_AS_COUNT',
}

export interface LogDestinationConfig {
  /**
   * The AWS service to which the logs should be sent.
   */
  readonly logDestinationService: LogDestinationService;
  /**
   * A name suffix for an automatically created log destination. Destination names must
   * start with aws-waf-logs and can end with any suffix you want.
   * If an existing log destination is provided, this is ignored.
   *
   * @default The id of the web ACL
   */
  readonly logSuffix?: string;
  /**
   * Determine the removal policy of the log destination.
   *
   * @default RETAIN
   */
  readonly removalPolicy?: core.RemovalPolicy;
  /**
   * How long, in days, the log contents will be retained.
   *
   * @default One month
   */
  readonly retentionDays?: logs.RetentionDays;
}

/**
 * Properties for a LoggingConfiguration.
 */
export interface LoggingConfigurationProps {
  /**
   * The WAF web ACL to attach this logging configuration to.
   */
  readonly webAcl: WebACL;
  /**
   * The configuration for the log destination.
   */
  readonly logDestinationConfig: LogDestinationConfig;
  /**
   * Filtering that specifies which web requests are kept in the logs and which are dropped.
   *
   * You can filter on the rule action and on the web request labels that were applied by matching rules during web ACL evaluation.
   *
   * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_wafv2.CfnLoggingConfiguration.html#loggingfilter
   * @default Only log blocked requests
   */
  readonly loggingFilter?: LoggingFilterConfiguration;
  /**
   * The parts of the request that you want to keep out of the logs.
   *
   * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_wafv2.CfnLoggingConfiguration.html#redactedfields
   * @default none
   */
  readonly redactedFields?: CfnRuleGroup.FieldToMatchProperty[];
}

export class LoggingConfiguration extends core.Resource {
  public readonly logDestinationArn: string;
  public readonly logGroup: logs.ILogGroup | undefined;
  constructor(scope: Construct, id: string, props: LoggingConfigurationProps) {
    super(scope, id);

    // By default, log blocked requests only
    const loggingFilter: LoggingFilterConfiguration =
      props.loggingFilter ||
      LoggingFilterConfiguration.defaultDrop([
        LoggingFilter.keepIfMeetsAny([
          LoggingFilterCondition.action(
            LoggingFilterActionConditionAction.BLOCK,
          ),
        ]),
      ]);

    // By default, redact nothing
    const redactedFields = props.redactedFields || [];

    // By default, retain logs for one month
    const retentionDays =
      props.logDestinationConfig.retentionDays || logs.RetentionDays.ONE_MONTH;

    // By default, retain the log group when the web ACL is deleted
    const removalPolicy =
      props.logDestinationConfig.removalPolicy || core.RemovalPolicy.RETAIN;

    // By default, use the web ACL id in the log destination name
    const logSuffix =
      props.logDestinationConfig.logSuffix || props.webAcl.webAclId;

    // Create a log group
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: retentionDays,
      removalPolicy: removalPolicy,
      logGroupName: `aws-waf-logs-${logSuffix}`,
    });

    // Log group ARNs include a trailing ':*' that the LoggingConfiguration isn't expecting, so we remove it here.
    this.logDestinationArn = core.Fn.select(
      0,
      core.Fn.split(':*', this.logGroup.logGroupArn),
    );

    new CfnLoggingConfiguration(this, 'Resource', {
      resourceArn: props.webAcl.webAclArn,
      logDestinationConfigs: [this.logDestinationArn],
      loggingFilter: loggingFilter,
      redactedFields: redactedFields,
    });
  }
}

/**
 * Filtering that specifies which web requests are kept in the logs and which are dropped.
 * You can filter on the rule action and on the web request labels that were applied by matching rules
 * during web ACL evaluation.
 */
export abstract class LoggingFilterConfiguration {
  /**
   * Keep logs that don't match any of the specified filter conditions.
   * @param filters
   * @returns LoggingFilterConfiguration
   */
  public static defaultKeep(
    filters: LoggingFilter[],
  ): LoggingFilterConfiguration {
    return {
      DefaultBehavior: LoggingFilterBehavior.KEEP,
      Filters: filters,
    };
  }

  /**
   * Drop logs that don't match any of the specified filter conditions.
   * @param filters
   * @returns LoggingFilterConfiguration
   */
  public static defaultDrop(
    filters: LoggingFilter[],
  ): LoggingFilterConfiguration {
    return {
      DefaultBehavior: LoggingFilterBehavior.DROP,
      Filters: filters,
    };
  }
}

/**
 * A single logging filter, using in LoggingFilterConfiguration.
 */
export abstract class LoggingFilter {
  /**
   * Keep logs that meet any of the specified conditions.
   * @param conditions
   * @returns LoggingFilter
   */
  public static keepIfMeetsAny(
    conditions: LoggingFilterCondition[],
  ): LoggingFilter {
    return {
      Requirement: LoggingFilterRequirement.MEETS_ANY,
      Conditions: conditions,
      Behavior: LoggingFilterBehavior.KEEP,
    };
  }

  /**
   * Keep logs that meet all of the specified conditions.
   * @param conditions
   * @returns LoggingFilter
   */
  public static keepIfMeetsAll(
    conditions: LoggingFilterCondition[],
  ): LoggingFilter {
    return {
      Requirement: LoggingFilterRequirement.MEETS_ALL,
      Conditions: conditions,
      Behavior: LoggingFilterBehavior.KEEP,
    };
  }

  /**
   * Drop logs that meet any of the specified conditions.
   * @param conditions
   * @returns LoggingFilter
   */
  public static dropIfMeetsAny(
    conditions: LoggingFilterCondition[],
  ): LoggingFilter {
    return {
      Requirement: LoggingFilterRequirement.MEETS_ANY,
      Conditions: conditions,
      Behavior: LoggingFilterBehavior.DROP,
    };
  }

  /**
   * Drop logs that meet all of the specified conditions.
   * @param conditions
   * @returns LoggingFilter
   */
  public static dropIfMeetsAll(
    conditions: LoggingFilterCondition[],
  ): LoggingFilter {
    return {
      Requirement: LoggingFilterRequirement.MEETS_ALL,
      Conditions: conditions,
      Behavior: LoggingFilterBehavior.DROP,
    };
  }
}

/**
 * A single match condition for a LoggingFilter. You can filter on the action or label name.
 */
export abstract class LoggingFilterCondition {
  /**
   * A single action condition. This is the action setting that a log record must contain in order to meet the condition.
   * @param action
   * @returns LoggingFilterCondition
   */
  public static action(
    action: LoggingFilterActionConditionAction,
  ): LoggingFilterCondition {
    return {
      ActionCondition: {
        Action: action,
      },
    };
  }
  /**
   * A single label name condition. This is the fully qualified label name that a log record must contain in order to meet the condition.
   * Fully qualified labels have a prefix, optional namespaces, and label name. The prefix identifies the rule group or web ACL context
   * of the rule that added the label.
   * @param labelName
   * @returns LoggingFilterCondition
   */
  public static labelName(labelName: string): LoggingFilterCondition {
    return {
      LabelNameCondition: {
        LabelName: labelName,
      },
    };
  }
}
