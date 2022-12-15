import { Template } from '@aws-cdk/assertions';
import { Stack } from '@aws-cdk/core';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontorigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
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
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('todo', () => {
    // TODO
  });
});

describe('Custom rule groups', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('todo', () => {
    // TODO
  });
});

describe('Default action', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('todo', () => {
    // TODO
  });
});

describe('Request sampling', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('todo', () => {
    // TODO
  });
});

describe('Logging', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('todo', () => {
    // TODO
  });
});