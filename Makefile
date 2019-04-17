include .env

AWS_BUCKET_NAME ?= $(AWS_STACK_NAME)-v2

default: buildapp awspackage awsdeploy
# default: awspackage awsdeploy

deploy: compileapp awspackage awsdeploy

compileapp:
	@rm -fr build/* && \
	yarn run build && \
	cp package.json build/ && \
	cp ./src/config/defaults.yaml build/config/ && \
	cd ./build && \
	yarn install --prod

buildapp:
	cp ./src/config/defaults.yaml build/config/ && \
	yarn run build

run: buildapp
	sam local start-api -n env.json

validate:
	sam validate

configure:
	@aws s3api create-bucket \
		--bucket $(AWS_BUCKET_NAME) \
		--region $(AWS_REGION) \
		--create-bucket-configuration LocationConstraint=$(AWS_REGION)

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
			ParamAppBucket=$(APP_BUCKET_NAME)

describe:
	@aws cloudformation describe-stacks \
		--region $(AWS_REGION) \
		--stack-name $(AWS_STACK_NAME)

outputs:
	@ make describe \
		| jq -r '.Stacks[0].Outputs'

.PHONY: buildapp compileapp configure default deploy buildapp run validate awspackage awsdeploy describe outputs

# arn:aws:lambda:ca-central-1:407205661819:function:universal-api-Lambda-X759KY8QFQDH
