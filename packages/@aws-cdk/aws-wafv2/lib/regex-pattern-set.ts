import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnRegexPatternSet } from './wafv2.generated';
import { Scope } from './web-acl';

/**
 * The interface that represents a RegexPatternSet resource.
 */
export interface IRegexPatternSet extends core.IResource {
  /**
   * The Amazon Resource Name (ARN) of the regex pattern set.
   *
   * @attribute
   */
  readonly regexPatternSetArn: string;
  /**
   * The name of the regex pattern set.
   *
   * @attribute
   */
  readonly regexPatternSetName: string;
}

/**
 * Properties for a RegexPatternSet
 */
export interface RegexPatternSetProps {
  /**
   * The name of the set. You cannot change the name after you create the set.
   *
   * @default - CloudFormation-generated name
   */
  readonly regexPatternSetName?: string;
  readonly description?: string;
  readonly scope: Scope;
  readonly regularExpressionList: string[]
  readonly tags?: core.Tag[];
}
/**
 * Use a RegexPatternSet to have AWS WAF inspect a web request component for a specific set
 * of regular expression patterns.
 *
 * @resource AWS::WAFv2::RegexPatternSet
 */
export class RegexPatternSet extends core.Resource implements IRegexPatternSet {
  /**
   * The Amazon Resource Name (ARN) of the regex pattern set.
   *
   * @attribute
   */
  public readonly regexPatternSetArn: string;
  /**
   * The ID of the regex pattern set.
   *
   * @attribute
   */
  public readonly regexPatternSetId: string;
  /**
   * The name of the regex pattern set.
   *
   * @attribute
   */
  public readonly regexPatternSetName: string;
  constructor(scope: Construct, id: string, props: RegexPatternSetProps) {
    super(scope, id);

    const resource = new CfnRegexPatternSet(this, 'Resource', {
      name: props.regexPatternSetName,
      description: props.description,
      scope: props.scope,
      tags: props.tags,
      regularExpressionList: props.regularExpressionList,
    });

    this.regexPatternSetArn = this.getResourceArnAttribute(resource.attrArn, {
      service: 'wafv2',
      resource: 'regexpatternset',
      resourceName: this.physicalName,
    });
    this.regexPatternSetId = resource.attrId;
    this.regexPatternSetName = this.getResourceNameAttribute(core.Fn.select(0, core.Fn.split('|', resource.ref)));
  }
}