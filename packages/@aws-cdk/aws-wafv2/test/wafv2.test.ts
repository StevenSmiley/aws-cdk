import { Template } from '@aws-cdk/assertions';
import { Stack } from '@aws-cdk/core';
import * as wafv2 from '../lib';

describe('Web ACL scope', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('scope is CLOUDFRONT', () => {
    new wafv2.WebACL(stack, 'WebACL', { scope: wafv2.Scope.CLOUDFRONT });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Scope: 'CLOUDFRONT',
    });
  });

  test('scope is REGIONAL', () => {
    new wafv2.WebACL(stack, 'WebACL', { scope: wafv2.Scope.REGIONAL });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Scope: 'REGIONAL',
    });
  });
});