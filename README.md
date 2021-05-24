# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

# 目次

1. [前提](#premise)
1. [使用](#use)
1. [注意](#attention)
1. [参照](#reference)
1. [感謝](#thanks)

## 前提 <a name="premise"></a>

- AWS アカウントと IAM ユーザー  
  （プログラムによるアクセス許可）
- AWS CLI  
  （インストール後 `aws configure` コマンドで IAM ユーザーの認証情報セットまで）
- Node.js
- AWS CDK ツールキット  
  （Node.js インストール後 `npm install -g aws-cdk` コマンドでインストール）
- IDE
- リージョン：us-east-1

## 使用 <a name="use"></a>

1. `npm install`（初回のみ）
1. `cdk bootstrap`（CDK 初回利用時のみ）
1. スタックデプロイと同時に s3 へ静的コンテンツをデプロイしたい場合は./s3 配下へ配置（別でデプロイしても良いし無くても可）
1. basic 認証のユーザー名とパスワードを変更する場合は./lambda/basic_auth.py の 8,9 行目を修正
1. EC2 管理アプリを動かしたい場合は./s3/index.html の 31,32 行目を IAM ユーザーのアクセスキー、シークレットアクセスキーで置換。  
   **※認証情報をハードコードするのは基本的に非推奨。何故やっているのかというと Cognito セットアップすんのがめんどくせえから。**  
   **認証のベストプラクティスは Cognito ユーザープールでの認証と ID プールでの認証されたユーザーへの EC2 操作認可。IAM ポリシーは最小権限の原則に従って必要な操作のみ許可するようにする。**
1. `npm run build`
1. デプロイ時に S3 バケット名をパラメータとして渡す。（YOUR-BUCKET-NAME を自身の作成したいバケット名で置換） `cdk deploy -c bucketName=YOUR-BUCKET-NAME`
1. コマンド出力の Outputs「https://~.cloudfront.net」へアクセス
1. クリーンアップは`cdk destroy`。※[注意](#attention)参照

## 注意 <a name="attention"></a>

- S3 バケットにオブジェクトが残っている状態で`cdk destroy`するとバケットが残る。  
  削除したい場合はバケットを空にしてから再度`cdk destroy`。それか事前に空にしとく。
- `cdk deploy`時に「fail: EEXIST: file already exists, mkdir ~ cdk.out\.cache」エラーが出た場合、cdk.out を丸ごと削除して再実行
- `cdk destroy`時に lambda@edge 削除エラーが発生する。  
  cloudfront に lambda のレプリカが残っているため発生するエラーで、  
  対処方法は数十分程度待ってから再度`cdk destroy`

## 参照 <a name="reference"></a>

- [使用させていただいた Lambda の Python コード](https://teratail.com/questions/224176)
- [AWS CDK リファレンス](https://docs.aws.amazon.com/cdk/api/latest/)
- [AWS CDK ワークショップ](https://cdkworkshop.com/)
- [AWS CDK example](https://github.com/aws-samples/aws-cdk-examples)

## 感謝 <a name="thanks"></a>

- qiita
- DevelopersIO
- GitHub
