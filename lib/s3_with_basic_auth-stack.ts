import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

export class S3WithBasicAuthStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CFN Parameters
    const lambdaFunctionName = new cdk.CfnParameter(this, 'lambdaFunctionName', {
      type: 'String',
      default: 'basic-auth',
    });

    // CFN Resources
    // s3
    const bucket = new s3.Bucket(this, 's3Bucket', {
      //bucketName: s3BucketName.valueAsString,
      bucketName: this.node.tryGetContext('bucketName'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const oai = new cloudfront.OriginAccessIdentity(this, 'cloudfrontOAI');
    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [bucket.bucketArn + '/*']
    });
    const s3Deployment = new s3deployment.BucketDeployment(this, 's3Deployment', {
      sources: [s3deployment.Source.asset('./s3')],
      destinationBucket: bucket,
    });
    bucket.addToResourcePolicy(bucketPolicy);

    // lambda
    const lambdaIamRole = new iam.Role(this, 'LambdaAtEdgeRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com'),
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });
    const lambdaFunction = new lambda.Function(this, 'basic-auth', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'basic_auth.lambda_handler',
      role: lambdaIamRole,
      functionName: lambdaFunctionName.valueAsString,
    });
    const lambdaVersion = new lambda.Version(this, 'lambdaVersion', {
      lambda: lambdaFunction,
    })

    // cloudfront
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'cloudfrontWebDist', {
      viewerCertificate: {
        aliases: [],
        props: {
          cloudFrontDefaultCertificate: true,
        },
      },
      // 最安の価格クラス、エッジロケーションは日本含まない。含める場合は200かALL。
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.seconds(0),
              defaultTtl: cdk.Duration.seconds(0),
              // 公開するS3バケットのパス。ルート以下全てのオブジェクトを許可する。
              pathPattern: '/*',
              lambdaFunctionAssociations: [
                {
                  eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: lambdaVersion,

                }
              ],
            },
          ],
        },
      ],
    });

    //CFN outputs
    //cloudfront
    new cdk.CfnOutput(this, 'cloudfrontUrl', {
      value: 'https://' + distribution.distributionDomainName,
    });
  }
}
