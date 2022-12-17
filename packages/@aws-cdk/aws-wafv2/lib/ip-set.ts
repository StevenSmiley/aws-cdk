import * as core from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnIPSet } from './wafv2.generated';
import { Scope } from './web-acl';

/**
 * The version of the IP addresses, either IPV4 or IPV6.
 */
export enum IPAddressVersion {
  /**
   * IPv4
   */
  IPV4 = 'IPV4',
  /**
   * IPv6
   */
  IPV6 = 'IPV6',
}

/**
 * The interface that represents an IPSet resource.
 */
export interface IIPSet extends core.IResource {
  /**
   * The Amazon Resource Name (ARN) of the IP set.
   *
   * @attribute
   */
  readonly ipSetArn: string;
  /**
   * The name of the IP set.
   *
   * @attribute
   */
  readonly ipSetName: string;
}

/**
 * Properties for an IPSet
 */
export interface IPSetProps {
  /**
   * The name of the IP set. You cannot change the name of an IPSet after you create it.
   * TODO: We disable aws-lint here because the name doesn't seem to match the expected pattern, but it looks correct
   * [disable-awslint:props-physical-name]
   * @default - CloudFormation-generated name
   */
  readonly ipSetName?: string;
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
export class IPSet extends core.Resource implements IIPSet {
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
  /**
   * The name of the IP set.
   *
   * @attribute
   */
  public readonly ipSetName: string;
  /**
   * The scope of the IP set.
   */
  public readonly scope: Scope;
  constructor(scope: Construct, id: string, props: IPSetProps) {
    super(scope, id);

    const resource = new CfnIPSet(this, 'Resource', {
      addresses: props.addresses,
      ipAddressVersion: props.ipAddressVersion,
      name: props.ipSetName,
      description: props.description,
      scope: props.scope,
      tags: props.tags,
    });

    this.scope = props.scope;
    this.ipSetArn = this.getResourceArnAttribute(resource.attrArn, {
      service: 'wafv2',
      resource: 'ipset',
      resourceName: this.physicalName,
    });
    this.ipSetId = resource.attrId;
    this.ipSetName = this.getResourceNameAttribute(core.Fn.select(0, core.Fn.split('|', resource.ref)));
  }
}