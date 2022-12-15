import { Template } from '@aws-cdk/assertions';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cloudfrontorigins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as stepfunctions from '@aws-cdk/aws-stepfunctions';
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

describe('Web ACL associations', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('Associated with CloudFront distribution', () => {
    const bucket = new s3.Bucket(stack, 'Bucket');
    const distribution = new cloudfront.Distribution(stack, 'Dist', {
      defaultBehavior: { origin: new cloudfrontorigins.S3Origin(bucket) },
    });
    const webAcl = new wafv2.WebACL(stack, 'WebACL', { scope: wafv2.Scope.CLOUDFRONT });
    webAcl.attachTo(distribution);
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        WebACLId: {
          'Fn::GetAtt': ['WafWebAcl927DE5F9', 'Arn'],
        },
      },
    });
  });

  test('Associated with API Gateway stage', () => {
    const stateMachine = new stepfunctions.StateMachine(stack, 'StateMachine', {
      stateMachineType: stepfunctions.StateMachineType.EXPRESS,
      definition: stepfunctions.Chain.start(
        new stepfunctions.Pass(stack, 'Pass'),
      ),
    });
    const restApi = new apigateway.RestApi(stack, 'RestApi', { deploy: true });
    restApi.root.addMethod(
      'GET',
      apigateway.StepFunctionsIntegration.startExecution(stateMachine),
    );

    const webAcl = new wafv2.WebACL(stack, 'WebACL', { scope: wafv2.Scope.REGIONAL });
    webAcl.attachTo(restApi.deploymentStage);

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::WAFv2::WebACLAssociation', {
      WebACLArn: {
        'Fn::GetAtt': ['WafWebAcl927DE5F9', 'Arn'],
      },
      ResourceArn: {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':apigateway:',
            {
              Ref: 'AWS::Region',
            },
            '::/restapis/',
            {
              Ref: 'RestApi0C43BF4B',
            },
            '/stages/',
            {
              Ref: 'RestApiDeploymentStageprod3855DE66',
            },
          ],
        ],
      },
    });
  });

  test('Associated with Application Load Balancer', () => {
    // TODO
  });

  test('Associated with Cognito user pool', () => {
    // TODO
  });

  test('Associated with AppSync GraphQL API', () => {
    // TODO
  });

  test('Associated with multiple regional resources', () => {
    // TODO
  });

  test('Associated with multiple CloudFront resources', () => {
    // TODO
  });

  test('Error trying to associate resource with incompatible scope', () => {
    // TODO
  });

  test('todo', () => {
    // TODO
  });
});

describe('Managed rule groups', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('AWS Managed rule group, default', () => {
    // TODO
  });

  test('AWS Managed rule group, pin version', () => {
    // TODO
  });

  test('AWS Managed rule group, override rule group action to count', () => {
    // TODO
  });

  test('AWS Managed rule group, exclude rules', () => {
    // TODO
  });

  test('AWS Managed rule group, scope-down rule', () => {
    // TODO
  });

  test('AWS Marketplace rule group', () => {
    // TODO
  });
});

describe('Custom rule groups', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('Rule action: ALLOW', () => {
    // TODO
  });

  test('Rule action: ALLOW with custom headers and label', () => {
    // TODO
  });

  test('Rule action: BLOCK', () => {
    // TODO
  });

  test('Rule action: BLOCK with custom response and label', () => {
    // TODO
  });

  test('Rule action: COUNT', () => {
    // TODO
  });

  test('Rule action: COUNT with custom headers and label', () => {
    // TODO
  });

  test('Rule action: CAPTCHA', () => {
    // TODO
  });

  test('Rule action: CAPTCHA with custom immunity time, headers, and label', () => {
    // TODO
  });

  test('Rule action: CHALLENGE', () => {
    // TODO
  });

  test('Rule action: CHALLENGE with custom immunity time and label', () => {
    // TODO
  });

  test('Statement: Originates from a county in, source IP', () => {
    // TODO
  });

  test('Statement: Originates from a county in, IP address in header', () => {
    // TODO
  });

  test('Statement: Originates from an IP address in, source IP', () => {
    // TODO
  });

  test('Statement: Originates from an IP address in, IP address in header', () => {
    // TODO
  });

  test('Statement: Has a label, match label', () => {
    // TODO
  });

  test('Statement: Has a label, match label namespace', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, exactly matches string', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, starts with string', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, ends with string', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, contains string', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, contains words', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, pattern from regex pattern set', () => {
    // TODO
  });

  test('Statement: Inspect single header, string match, regex', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, equals', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, not equal to', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, less than or equal to', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, less than', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, greater than or equal to', () => {
    // TODO
  });

  test('Statement: Inspect single header, size match, greater than', () => {
    // TODO
  });

  test('Statement: Inspect single header, attack match, SQL injection', () => {
    // TODO
  });

  test('Statement: Inspect single header, attack match, XSS injection', () => {
    // TODO
  });

  test('Statement: Inspect all headers', () => {
    // TODO
  });

  test('Statement: Inspect cookies', () => {
    // TODO
  });

  test('Statement: Inspect single query parameter', () => {
    // TODO
  });

  test('Statement: Inspect all query parameters', () => {
    // TODO
  });

  test('Statement: Inspect URI path', () => {
    // TODO
  });

  test('Statement: Inspect query string', () => {
    // TODO
  });

  test('Statement: Inspect body', () => {
    // TODO
  });

  test('Statement: Inspect HTTP method', () => {
    // TODO
  });

  test('Statement: Text transformations', () => {
    // TODO
  });

  test('Match logic: AND', () => {
    // TODO
  });

  test('Match logic: OR', () => {
    // TODO
  });

  test('Match logic: NOT', () => {
    // TODO
  });

  test('Combine rules into rule group', () => {
    // TODO: AWS::WAFv2::RuleGroup https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-rulegroup.html
  });

  test('Override rule group action to COUNT', () => {
    // TODO: AWS::WAFv2::RuleGroup https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-rulegroup.html
  });
});

test('Regex Pattern Set', () => {
  // TODO: AWS::WAFv2::RegexPatternSet https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-regexpatternset.html
});

describe('IP Set', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('IPv4', () => {
    // TODO: AWS::WAFv2::IPSet https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-ipset.html
  });

  test('IPv6', () => {
    // TODO
  });
});

describe('Default action', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('Allow', () => {
    // TODO
  });

  test('Allow with custom headers', () => {
    // TODO
  });

  test('Block', () => {
    // TODO
  });

  test('Block with custom response', () => {
    // TODO
  });
});

describe('Request sampling', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('Default to enabled sampling', () => {
    // TODO: AWS::WAFv2::WebACL VisibilityConfig SampledRequestsEnabled is true
  });

  test('Enabled sampling when specified', () => {
    // TODO
  });

  test('Disabled sampling when specified', () => {
    // TODO
  });

  test('Enable with exclusions', () => {
    // TODO: check default action sampling, rules
  });
});

describe('Logging', () => {
  // let stack: Stack;
  // beforeEach(() => {
  //   stack = new Stack();
  // });

  test('No logging by default', () => {
    // TODO
  });

  test('Send logs to CloudWatch Logs, new log group, with defaults', () => {
    // TODO
  });

  test('Send logs to CloudWatch Logs, new log group, override defaults', () => {
    // TODO
  });

  test('Send logs to CloudWatch Logs, provided log group', () => {
    // TODO
  });

  test('Send logs to S3, new bucket, with defaults', () => {
    // TODO
  });

  test('Send logs to S3, new bucket, override defaults', () => {
    // TODO
  });

  test('Send logs to S3, provided bucket', () => {
    // TODO
  });

  test('Send logs to Kinesis Firehose, new stream, with defaults', () => {
    // TODO
  });

  test('Send logs to Kinesis Firehose, new stream, override defaults', () => {
    // TODO
  });

  test('Send logs to Kinesis Firehose, provided stream', () => {
    // TODO
  });

  test('Logging filter, default keep', () => {
    // TODO
  });

  test('Logging filter, default drop', () => {
    // TODO
  });

  test('Logging filter, filter condition, rule action', () => {
    // TODO
  });

  test('Logging filter, filter condition, label', () => {
    // TODO
  });

  test('Logging filter, keep if meets any', () => {
    // TODO
  });

  test('Logging filter, keep if meets all', () => {
    // TODO
  });

  test('Logging filter, drop if meets any', () => {
    // TODO
  });

  test('Logging filter, drop if meets all', () => {
    // TODO
  });

  test('Redacted fields', () => {
    // TODO
  });
});