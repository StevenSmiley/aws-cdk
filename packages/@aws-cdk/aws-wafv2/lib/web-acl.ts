import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cognito from '@aws-cdk/aws-cognito';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import {
  LogDestinationConfig,
  LoggingConfiguration,
  LoggingFilterConfiguration,
} from './logging-configuration';
import { ManagedRuleGroup } from './rule-group';
import { CfnWebACL, CfnWebACLAssociation } from './wafv2.generated';

/**
 * Specifies whether this is for an Amazon CloudFront distribution or for a regional application.
 */
export enum Scope {
  /**
   * A web ACL with regional scope supports an Application Load Balancer (ALB), an Amazon API Gateway REST API,
   * an AWS AppSync GraphQL API, or an Amazon Cognito user pool.
   */
  REGIONAL = 'REGIONAL',
  /**
   * A web ACL with scope CloudFront supports CloudFront distributions only.
   *
   * Note: For CLOUDFRONT, you must create your WAFv2 resources in the US East (N. Virginia) Region, us-east-1.
   */
  CLOUDFRONT = 'CLOUDFRONT',
}

/**
 * The action to perform if no WebACL rules match.
 */
export abstract class DefaultAction {
  /**
   * Allow requests.
   */
  public static allow(
    customRequestHandling?: CfnWebACL.CustomRequestHandlingProperty,
  ) {
    const defaultAction: CfnWebACL.DefaultActionProperty = {
      allow: { customRequestHandling },
    };
    return defaultAction;
  }

  /**
   * Block requests.
   */
  public static block(customResponse?: CfnWebACL.CustomResponseProperty) {
    const defaultAction: CfnWebACL.DefaultActionProperty = {
      block: { customResponse },
    };
    return defaultAction;
  }
}

/**
 * The interface that represents a WebACL resource.
 */
export interface IWebACL extends core.IResource {
  /**
   * The Amazon Resource Name (ARN) of the web ACL.
   *
   * @attribute
   */
  readonly webAclArn: string;
  /**
   * The name of the web ACL.
   *
   * You cannot change the name of a web ACL after you create it.
   *
   * @attribute
   */
  readonly webAclName: string;
}

export interface WebACLProps {
  /**
   * The name of the web ACL. You cannot change the name of a web ACL after you create it.
   *
   * @default - CloudFormation-generated name
   */
  readonly webAclName?: string;
  /**
   * A description of the web ACL that helps with identification.
   *
   * @default - None
   */
  readonly description?: string;
  /**
   * Specifies whether this is for an Amazon CloudFront distribution or for a regional application.
   * A regional application can be an Application Load Balancer (ALB), an Amazon API Gateway REST API,
   * an AWS AppSync GraphQL API, or an Amazon Cognito user pool.
   * Note: For CLOUDFRONT, you must create your WAFv2 resources in the US East (N. Virginia) Region, us-east-1.
   */
  readonly scope: Scope;
  /**
   * The action to perform if none of the Rules contained in the WebACL match.
   *
   * @default - Allow
   */
  readonly defaultAction?: DefaultAction;
  /**
   * Defines and enables Amazon CloudWatch metrics and web request sample collection.
   */
  readonly visibilityConfig?: CfnWebACL.VisibilityConfigProperty;
  /**
   * The rule statements used to identify the web requests that you want to allow, block, or count.
   * Each rule includes one top-level statement that AWS WAF uses to identify matching web requests,
   * and parameters that govern how AWS WAF handles them.
   *
   * @default - None
   */
  // TODO: support Rule, RuleGroup
  readonly rules?: ManagedRuleGroup[];
  /**
   * Specifies how AWS WAF should handle CAPTCHA evaluations for rules that don't have their own CaptchaConfig settings.
   *
   * @default - The immunity time for successful CAPTCHA challenges is 300 seconds.
   */
  readonly captchaConfig?: CfnWebACL.CaptchaConfigProperty;
  /**
   * Specifies the domains that AWS WAF should accept in a web request token.
   * This enables the use of tokens across multiple protected websites. When AWS WAF provides a token, it uses the domain
   * of the AWS resource that the web ACL is protecting. With a token domain list, AWS WAF accepts the resource's host domain
   * plus all domains in the token domain list, including their prefixed subdomains.
   *
   * @default - AWS WAF accepts tokens only for the domain of the protected resource.
   */
  readonly tokenDomains?: string[];
}

/**
 * Use a WebACL to define a collection of rules to use to inspect and control web requests.
 *
 * Each rule has an action defined (allow, block, or count) for requests that match the statement of the rule.
 * In the web ACL, you assign a default action to take (allow, block) for any request that does not match any of the rules.
 * The rules in a web ACL can contain rule statements that you define explicitly and rule statements that reference
 * rule groups and managed rule groups. You can associate a web ACL with one or more AWS resources to protect.
 * The resources can be an Amazon CloudFront distribution, an Amazon API Gateway REST API, an Application Load Balancer,
 * or an AWS AppSync GraphQL API.
 *
 * @resource AWS::WAFv2::WebACL
 */
export class WebACL extends core.Resource implements IWebACL {
  /**
   * The name of the web ACL.
   *
   * You cannot change the name of a web ACL after you create it.
   *
   * @attribute
   */
  public readonly webAclName: string;
  /**
   * The Amazon Resource Name (ARN) of the web ACL.
   *
   * @attribute
   */
  public readonly webAclArn: string;
  /**
   * The ID of the web ACL.
   *
   * @attribute
   */
  public readonly webAclId: string;
  /**
   * The web ACL capacity units (WCUs) currently being used by this web ACL.
   *
   * AWS WAF uses WCUs to calculate and control the operating resources that are used to run your rules,
   * rule groups, and web ACLs. AWS WAF calculates capacity differently for each rule type,
   * to reflect the relative cost of each rule. Simple rules that cost little to run use fewer
   * WCUs than more complex rules that use more processing power. Rule group capacity is fixed at creation,
   * which helps users plan their web ACL WCU usage when they use a rule group. The WCU limit for web ACLs is 1,500.
   */
  public readonly webAclCapacity: number;
  /**
   * The label namespace prefix for this web ACL.
   *
   * All labels added by rules in this web ACL have this prefix.
   *
   * The syntax for the label namespace prefix for a web ACL is the following: awswaf:<account ID>:webacl:<web ACL name>:
   *
   * When a rule with a label matches a web request, AWS WAF adds the fully qualified label to the request. A fully qualified label is made up of the label namespace from the rule group or web ACL where the rule is defined and the label from the rule, separated by a colon.
   */
  public readonly webAclLabelNamespace: string;
  /**
   * The action to perform if none of the Rules contained in the WebACL match.
   */
  public readonly defaultAction: DefaultAction;
  // TODO: Request sampling
  public requestSampling?: any;
  constructor(scope: Construct, id: string, props: WebACLProps) {
    super(scope, id);

    this.defaultAction = props.defaultAction || DefaultAction.allow();

    const prioritizedRules = this.prioritizeRules(props.rules);

    // TODO: generate this based on input parameters
    const visibilityConfig: CfnWebACL.VisibilityConfigProperty = {
      cloudWatchMetricsEnabled: true,
      metricName: 'WAF-Default',
      sampledRequestsEnabled: true,
    };

    const resource = new CfnWebACL(this, 'Resource', {
      scope: props.scope,
      defaultAction: this.defaultAction,
      visibilityConfig: visibilityConfig,
      description: props.description,
      name: props.webAclName,
      rules: prioritizedRules,
      captchaConfig: props.captchaConfig,
      // TODO: customResponseBodies must come from the rules
      // customResponseBodies: props.customResponseBodies,
    });
    if (props.tokenDomains) {
      resource.addPropertyOverride('TokenDomains', props.tokenDomains);
    }

    this.webAclName = this.getResourceNameAttribute(core.Fn.select(0, core.Fn.split('|', resource.ref)));
    this.webAclArn = this.getResourceArnAttribute(resource.attrArn, {
      service: 'wafv2',
      resource: 'webacl',
      resourceName: this.physicalName,
    });
    this.webAclCapacity = resource.attrCapacity;
    this.webAclId = resource.attrId;
    this.webAclLabelNamespace = resource.attrLabelNamespace;
  }

  /**
   * Set the logging configuration for this WebACL. Only one log destination is allowed.
   * @param logDestinationConfig
   * @param loggingFilterConfiguration
   * @param redactedFields
   */
  public setLoggingConfiguration(
    logDestinationConfig: LogDestinationConfig,
    loggingFilterConfiguration?: LoggingFilterConfiguration,
    redactedFields?: any,
  ) {
    new LoggingConfiguration(
      this,
      'LoggingConfiguration',
      {
        logDestinationConfig: logDestinationConfig,
        loggingFilter: loggingFilterConfiguration,
        redactedFields: redactedFields,
        webAcl: this,
      },
    );
  }

  // TODO: Check scope compatibility (regional vs cloudfront)
  // TODO: Keep track of attachedResources in array
  // Support for AppSync unavailable while AppSync package is experimental
  // TODO: Annotation with @example
  public attachTo(
    protectedResource:
    | cloudfront.Distribution
    | elbv2.ApplicationLoadBalancer
    | apigateway.Stage
    | cognito.UserPool,
  ) {
    if (protectedResource instanceof cloudfront.Distribution) {
      // Associate with CloudFront distribution using property override
      const cloudfrontDistribution = protectedResource.node
        .defaultChild as cloudfront.CfnDistribution;
      cloudfrontDistribution.addPropertyOverride(
        'DistributionConfig.WebACLId',
        this.webAclArn,
      );
    } else if (protectedResource instanceof apigateway.Stage) {
      new CfnWebACLAssociation(
        this,
        `WeblAclAssociation-${protectedResource.toString()}`,
        {
          resourceArn: protectedResource.stageArn,
          webAclArn: this.webAclArn,
        },
      );
    } else if (
      protectedResource instanceof elbv2.ApplicationLoadBalancer
    ) {
      new CfnWebACLAssociation(
        this,
        `WeblAclAssociation-${protectedResource.toString()}`,
        {
          resourceArn: protectedResource.loadBalancerArn,
          webAclArn: this.webAclArn,
        },
      );
    } else if (protectedResource instanceof cognito.UserPool) {
      new CfnWebACLAssociation(
        this,
        `WeblAclAssociation-${protectedResource.toString()}`,
        {
          resourceArn: protectedResource.userPoolArn,
          webAclArn: this.webAclArn,
        },
      );
    }
  }

  // TODO: also support RuleGroup, Rule
  private prioritizeRules(rules: any[] | undefined): CfnWebACL.RuleProperty[] {
    // For each rule, set the priority to the index of the rule
    if (rules !== undefined) {
      const prioritizedRules: CfnWebACL.RuleProperty[] = rules.map((rule) => {
        return {
          priority: rules.indexOf(rule),
          ...rule,
        };
      });
      return prioritizedRules;
    } else {
      return [];
    }
  }
}
