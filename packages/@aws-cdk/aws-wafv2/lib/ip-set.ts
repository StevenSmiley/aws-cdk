import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnIPSet } from './wafv2.generated';
import { Scope } from './web-acl';

/**
 * TODO
 */
export enum IPAddressVersion {
  /**
   * TODO
   */
  IPV4 = 'IPV4',
  /**
   * TODO
   */
  IPV6 = 'IPV6',
}

/**
 * TODO
 */
export interface IPSetProps {
  readonly name?: string;
  readonly description?: string;
  readonly scope: Scope;
  readonly ipAddressVersion: IPAddressVersion;
  // TODO: Provide better type for this https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-ipset.html#aws-resource-wafv2-ipset-properties
  readonly addresses: string[];
  readonly tags?: core.Tag[];
}

/**
 * Use an IPSet to identify web requests that originate from specific IP addresses
 * or ranges of IP addresses. For example, if you're receiving a lot of requests from a ranges
 * of IP addresses, you can configure AWS WAF to block them using an IP set that lists those IP addresses.
 *
 * @resource AWS::WAFv2::IPSet
 */
export class IPSet extends core.Resource {
  /**
   * The Amazon Resource Name (ARN) of the IP set.
   *
   * @attribute
   */
  public readonly ipSetArn: string;
  /**
   * The ID of the IP set.
   *
   * @attribute
   */
  public readonly ipSetId: string;
  constructor(scope: Construct, id: string, props: IPSetProps) {
    super(scope, id);

    const resource = new CfnIPSet(this, 'Resource', {
      addresses: props.addresses,
      ipAddressVersion: props.ipAddressVersion,
      name: props.name,
      description: props.description,
      scope: props.scope,
      tags: props.tags,
    });

    this.ipSetArn = this.getResourceArnAttribute(resource.attrArn, {
      service: 'wafv2',
      resource: 'ipset',
      resourceName: this.physicalName,
    });
    this.ipSetId = resource.attrId;
  }
}