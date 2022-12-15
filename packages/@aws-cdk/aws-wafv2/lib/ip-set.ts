import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnIPSet } from './wafv2.generated';
import { Scope } from './web-acl';

// TODO: Annotations
export enum IPAddressVersion {
  IPV4 = 'IPV4',
  IPV6 = 'IPV6',
}

export interface IPSetProps {
  readonly name?: string;
  readonly description?: string;
  readonly scope: Scope;
  readonly ipAddressVersion: IPAddressVersion;
  // TODO: Provide better type for this https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-ipset.html#aws-resource-wafv2-ipset-properties
  readonly addresses: string[];
  readonly tags?: core.Tag[];
}

export class IPSet extends core.Resource {
  constructor(scope: Construct, id: string, props: IPSetProps) {
    super(scope, id);

    new CfnIPSet(this, 'Resource', {
      addresses: props.addresses,
      ipAddressVersion: props.ipAddressVersion,
      name: props.name,
      description: props.description,
      scope: props.scope,
      tags: props.tags,
    });
  }
}