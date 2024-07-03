import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

import { Construct } from "constructs";
// import * as sqs 1from 'aws-cdk-lib/aws-sqs'l;

export class PrimeralambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const greetingsTable = new dynamodb.Table(this, "GreetingsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const saveHelloFunction = new lambda.Function(this, "SaveHelloFunction", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, "lambda")),
      handler: "handler.saveHello",
      environment: {
        GREETINGS_TABLE_NAME: greetingsTable.tableName,
      },
    });

    // example resource
    // const queue = new sqs.Queue(this, 'AwsTypQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    greetingsTable.grantReadWriteData(saveHelloFunction);

    const helloApi = new apigw.RestApi(this, "HelloApi");

    helloApi.root
      .addResource("saveHello")
      .addMethod("POST", new apigw.LambdaIntegration(saveHelloFunction));
  }
}
