import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnRegexPatternSet } from './wafv2.generated';
import { Scope } from './web-acl';

// TODO: Annotations
export interface RegexPatternSetProps {
  readonly name?: string;
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
export class RegexPatternSet extends core.Resource {
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
  constructor(scope: Construct, id: string, props: RegexPatternSetProps) {
    super(scope, id);

    const resource = new CfnRegexPatternSet(this, 'Resource', {
      name: props.name,
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
  }
}