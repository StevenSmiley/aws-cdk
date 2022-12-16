import * as iam from '@aws-cdk/aws-iam';
import * as kinesis from '@aws-cdk/aws-kinesis';
import * as logs from '@aws-cdk/aws-logs';
import * as s3 from '@aws-cdk/aws-s3';
import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnLoggingConfiguration, CfnRuleGroup } from './wafv2.generated';
import { WebACL } from './web-acl';

/**
 * TODO
 */
export enum LogDestinationService {
  CLOUDWATCH = 'CLOUDWATCH',
  S3 = 'S3',
  KINESIS = 'KINESIS',
}

/**
 * TODO
 */
export enum LoggingFilterBehavior {
  KEEP = 'KEEP',
  DROP = 'DROP',
}

/**
 * TODO
 */
export enum LoggingFilterRequirement {
  MEETS_ANY = 'MEETS_ANY',
  MEETS_ALL = 'MEETS_ALL',
}

/**
 * TODO
 */
export enum LoggingFilterActionConditionAction {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  COUNT = 'COUNT',
  CAPTCHA = 'CAPTCHA',
  CHALLENGE = 'CHALLENGE',
  EXCLUDED_AS_COUNT = 'EXCLUDED_AS_COUNT',
}

/**
 * TODO
 */
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
   * How long the log contents will be retained.
   *
   * @default One month
   */
  readonly retentionPeriod?: logs.RetentionDays;
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

/**
 * Defines an association between logging destinations and a web ACL resource, for logging from AWS WAF.
 * As part of the association, you can specify parts of the standard logging fields to keep out of the
 * logs and you can specify filters so that you log only a subset of the logging records.
 *
 * @resource AWS::WAFv2::LoggingConfiguration
 */
export class LoggingConfiguration extends core.Resource {
  public readonly logDestinationArn: string;
  public readonly logGroup: logs.ILogGroup | undefined;
  public readonly logBucket: s3.IBucket | undefined;
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
          LoggingFilterCondition.action(
            LoggingFilterActionConditionAction.COUNT,
          ),
        ]),
      ]);

    // By default, redact nothing
    const redactedFields = props.redactedFields || [];

    const logSuffix =
      props.logDestinationConfig.logSuffix || props.webAcl.webAclId;

    switch (props.logDestinationConfig.logDestinationService) {
      case LogDestinationService.S3:
        this.logBucket = new s3.Bucket(this, 'LogBucket', {
          bucketName: `aws-waf-logs-${logSuffix}`,
          removalPolicy: core.RemovalPolicy.RETAIN,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
          encryption: s3.BucketEncryption.S3_MANAGED,
          lifecycleRules: [
            {
              expiration: core.Duration.days(props.logDestinationConfig.retentionPeriod || 30),
              enabled: true,
            },
          ],
        });
        this.logDestinationArn = this.logBucket.bucketArn;
        // Permissions required to allow log delivery
        // See https://docs.aws.amazon.com/waf/latest/developerguide/logging-s3.html#logging-s3-permissions
        this.logBucket.addToResourcePolicy(
          new iam.PolicyStatement({
            sid: 'AWSLogDeliveryWrite',
            effect: iam.Effect.ALLOW,
            actions: ['s3:PutObject'],
            principals: [
              new iam.ServicePrincipal('delivery.logs.amazonaws.com'),
            ],
            resources: [`${this.logBucket.bucketArn}/*`],
            conditions: {
              StringEquals: {
                's3:x-amz-acl': 'bucket-owner-full-control',
                'aws:SourceAccount': [props.webAcl.env.account],
              },
              ArnLike: {
                'aws:SourceArn': [
                  `arn:${this.logBucket.stack.partition}:logs:${this.logBucket.stack.region}:${this.logBucket.stack.account}:*`,
                ],
              },
            },
          }),
        );
        this.logBucket.addToResourcePolicy(
          new iam.PolicyStatement({
            sid: 'AWSLogDeliveryAclCheck',
            effect: iam.Effect.ALLOW,
            actions: ['s3:GetBucketAcl'],
            principals: [
              new iam.ServicePrincipal('delivery.logs.amazonaws.com'),
            ],
            resources: [this.logBucket.bucketArn],
            conditions: {
              StringEquals: {
                'aws:SourceAccount': [props.webAcl.env.account],
              },
              ArnLike: {
                'aws:SourceArn': [
                  `arn:${this.logBucket.stack.partition}:logs:${this.logBucket.stack.region}:${this.logBucket.stack.account}:*`,
                ],
              },
            },
          }),
        );
        break;
      case LogDestinationService.CLOUDWATCH:
        // By default, retain logs for one month
        const retentionDays =
          props.logDestinationConfig.retentionPeriod || logs.RetentionDays.ONE_MONTH;

        // By default, retain the log group when the web ACL is deleted
        const removalPolicy =
          props.logDestinationConfig.removalPolicy || core.RemovalPolicy.RETAIN;

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
        break;
      case LogDestinationService.KINESIS:
        // Create a kinesis stream
        const kinesisStream = new kinesis.Stream(this, 'Stream', {
          retentionPeriod: core.Duration.days(props.logDestinationConfig.retentionPeriod || 30),
        });
        this.logDestinationArn = kinesisStream.streamArn;
        break;
    }

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
