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

export class RegexPatternSet extends core.Resource {
  constructor(scope: Construct, id: string, props: RegexPatternSetProps) {
    super(scope, id);

    new CfnRegexPatternSet(this, 'Resource', {
      name: props.name,
      description: props.description,
      scope: props.scope,
      tags: props.tags,
      regularExpressionList: props.regularExpressionList,
    });
  }
}