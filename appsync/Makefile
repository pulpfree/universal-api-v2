include .env

AWS_BUCKET_NAME ?= $(AWS_STACK_NAME)-v2
SCHEMA_LOCATION ?= s3://pf-tmp/schema/

default: deploy

deploy: awspackage awsdeploy

validate:
	sam validate

awspackage:
	@aws cloudformation package \
   --template-file ${FILE_TEMPLATE} \
   --output-template-file ${FILE_PACKAGE} \
   --s3-bucket $(AWS_BUCKET_NAME) \
   --s3-prefix $(AWS_BUCKET_PREFIX) \
   --profile $(AWS_PROFILE) \
   --region $(AWS_REGION)

awsdeploy:
	@aws cloudformation deploy \
   --template-file ${FILE_PACKAGE} \
   --region $(AWS_REGION) \
   --stack-name $(AWS_STACK_NAME) \
   --capabilities CAPABILITY_NAMED_IAM \
   --profile $(AWS_PROFILE) \
   --force-upload \
	 --parameter-overrides \
	 		ParamAccountId=$(AWS_ACCOUNT_ID) \
	 	  ParamProjectName=$(AWS_STACK_NAME) \
			ParamKeyExpiration=$(EXPIRATION) \
			ParamENV=$(ENV) \
			ParamLambdaARN=$(LAMBDA_ARN)

awsupdate:
	@aws cloudformation update-stack \
	 --stack-name $(AWS_STACK_NAME) \
   --template-body file://template.yml \
	 --capabilities CAPABILITY_NAMED_IAM \
	 --profile $(AWS_PROFILE) \
	 --parameters \
			ParameterKey=ParamProjectName,UsePreviousValue=true \
			ParameterKey=ParamENV,UsePreviousValue=true \
			ParameterKey=ParamLambdaARN,UsePreviousValue=true


#  --use-previous-template \

# see: https://stackoverflow.com/questions/46824171/how-do-i-force-a-cloudformation-stack-to-update-when-the-parameter-is-updated
# for info on how this should be done
# aws cloudformation update-stack --stack-name MyStack --template-body file:///Users/Documents/Git/project/cloudformation/stack.json --parameters file:///Users/Documents/Git/project/cloudformation/parameters/stack-parameters.dev.json --capabilities CAPABILITY_IAM

describe:
	@aws cloudformation describe-stacks \
		--region $(AWS_REGION) \
		--stack-name $(AWS_STACK_NAME)

outputs:
	@ make describe \
		| jq -r '.Stacks[0].Outputs'

pushschema:
	aws s3 cp ./schema.graphql $(SCHEMA_LOCATION)

.PHONY: buildapp compileapp configure default deploy buildapp run validate awspackage awsdeploy describe outputs
