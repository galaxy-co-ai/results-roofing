

| GAF |
| :---- |
| Digital Design API \- Integration |
| Integration Details Document  |

![][image1]

|  |
| :---- |

**Table of Contents**

[1\. Document Management	2](#document-management)

[2\. Introduction	3](#introduction)

[3\. Business Case	3](#business-case)

[3.1 Business or Customer Needs Addressed	3](#business-or-customer-needs-addressed)

[3.2 Criteria for Success	3](#criteria-for-success)

[4\. High Level Flow	4](#high-level-flow)

[5\. API Authentication	4](#api-authentication)

[**6\. API Endpoints	4**](#api-endpoints)

[**6.1 Get Access Token	4**](#get-access-token)

[**6.2 Site Status	5**](#site-status)

[**6.3 Coverage Check	6**](#coverage-check)

[**6.4 PartnerDetails ( Pricing / Configuration \- Not needed)	7**](#partnerdetails-\(-pricing-/-configuration---not-needed\))

[**6.5 Account Check	9**](#account-check)

[**6.6 Available Products	10**](#available-products)

[**6.7 Request Report	11**](#request-report)

[**6.8 Receive Report (Success) \- Quick Measure	19**](#receive-report-\(success\)---quick-measure)

[**6.9 Receive Report Failure ( QuickMeasure)	22**](#receive-report-failure-\(-quickmeasure\))

[**6.10 Receive Report (Success) \-**](#receive-report-\(success\)---add-on-\(formerly-quicksite\)) **[Add On (Formerly Quick Site)](#receive-report-\(failure\)---add-on-\(formerly-quicksite\))	[23](#receive-report-\(success\)---add-on-\(formerly-quicksite\))**

[**6.11 Receive Report (Failure) \- Add On (Formerly Quick Site)	24**](#receive-report-\(failure\)---add-on-\(formerly-quicksite\))

[**6.12 Receive Report (Success) \-  ScopeConnect	25**](#receive-report-\(success\)---scopeconnect)

[**6.13 Receive Report (Failure ) \-  ScopeConnect	26**](#receive-report-\(failure-\)---scopeconnect)

[**6.14 Download Report Assets	27**](#download-report-assets)

[**6.15 Download Report Assets	27**](#download-report-assets-1)

[**6.16 Receive Report (Request History)	27**](#receive-report-\(request-history\))

[**6.17 Receive Report (Request Existing Report)	47**](#receive-report-\(request-existing-report\))

[**7\. Postman collection	49**](#postman-collection)

[**8\. API Documentation on Swagger	49**](#api-documentation-on-swagger)

1. ## **Document Management** {#document-management}

Prepared by/Revision History:

| Name | Date | Version No. | Description |
| :---- | :---- | :---- | :---- |
| Samir Gandhi | 07/05/2023 | 1.0 | Initial Draft |
| Samir Gandhi | 11/01/2023 | 2.0 | Addition of new products |
| Samir Gandhi | 07/11/2024 | 3.0 | Updated scope connect questions and answers |

Reviewed/Approved by:

| Name | Date | Description | Approved (Y/N)? |
| :---- | :---- | :---- | :---- |
|  |  |  |  |

## 

Open Items:

| SrNo | Date | Description |
| :---- | :---- | :---- |
|  |  |  |

2. ## **Introduction** {#introduction}

The purpose of this document is to outline the integration details for GAF Partners with Digital Design Project.

3. ## **Business Case** {#business-case}

The Business Case can be found as follows.

1. ##   **Business or Customer Needs Addressed** {#business-or-customer-needs-addressed}

   This document outlines the features of GAF Quick Measure API services  for third   party integrations. 

   

   

   **Prerequisites:**

1) The vendor account to use API must be onboarded by GAF before starting to consume services.  
2) Addresses must be standardized by the vendor while placing an order and individual address fields along with latitude and longitude must be provided where applicable.  
3) A callback URL must be provided by Vendor where the Roof Measurement Data will be posted back for fulfillment of the report.

 


   2. ##  **Criteria for Success** {#criteria-for-success}

- Successful integration of GAF Partners with new version of Quick Measure API services.  
- Zero disruption (or loss of service) for contractors, should be seamless for users.


## 

4. ## **High Level Flow** {#high-level-flow}

   The High Level Flow for interaction between GAF Digital Design API  \-  Partner application is outlined as following as well available at [GAF Digital Design API Integration \- High Level Flow](https://drive.google.com/file/d/1YAZ3ytgrhkiFhJ2xtpbcGGXdh25SpaQ3/view?usp=drive_link)

   

   

   

   

5. ## **API Authentication**	         {#api-authentication}

All the end-pointsThe end points that are exposed by GAF will be secured using OKTA and the vendor must request an access token with API details provided in [GAF/Partner Integration Environment Details](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link) and it should be passed as Authorization Bearer token in all the requests.

Each endpoint will require a specific scope to allow access, so a list of scopes must be provided before acquiring the access token. (e.g. Subscriber:GetSubscriberDetails Subscriber:SiteStatus Subscriber:AccountCheck Subscriber:CoverageCheck)

	

6. ## **API Endpoints** {#api-endpoints}

   1. ##  **Get Access Token** {#get-access-token}

     The purpose of this endpoint is to allow Partners to request an Access Token for calling the API endpoints. This endpoint must be called before calling any API endpoint to acquire the Access Token. 

   Access Token must be subsequently passed as “Authorization Bearer” while calling all the API endpoints.

   

    

      1. Request Payload

      

    Following parameters will be required when requesting an access token.

   

| SrNo | Name | Description |
| :---- | :---- | :---- |
| 1 | client\_id | Client id for partner as shared in integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link) |
| 2 | client\_secret | Client secret for partner as shared in integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link) |
| 3 | grant\_type | client\_credentials |
| 4 | audience | Audience for partner as shared in integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link) |
| 5 | scope | Scopes for partner as shared in integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link) |

   

      2. Response Payload

   

   {

       "token\_type": "Bearer",

       "expires\_in": 3600,

       "access\_token": "generated\_accesstoken",

       "scope": "Subscriber:GetSubscriberDetails Subscriber:CoverageCheck Subscriber:SiteStatus Subscriber:AccountCheck"

   }

   

   

   2. ##  **Site Status** {#site-status}

    The purpose of this endpoint is to allow Partners to get GAF Quick Measure Site Status. It will respond

   

      1. Request Payload

      

            No parameters will be required for this endpoint.

      

      2. Response Payload

   

          

| SrNo | Name | Description |
| :---- | :---- | :---- |
| 1 | siteStatus | This will have the value of Open or Closed. It denotes working hours vs off-working hours or holidays. The time for processing a report can be higher during off-hours. |
| 2 | siteAverageResponseTime | Current Average Response Time for processing the reports in minutes. |

   

   JSON Structure.

   	        {

             "siteStatus": "Open",

             "siteAverageResponseTime": 6.0

                }

   

      

   3. ##  **Coverage Check** {#coverage-check}

   The purpose of this endpoint is to allow Partners to check coverage of a particular product for a given property address.

   

      1. Request Payload

      

   

| SrNo | Name | DescriptionMulti |
| :---- | :---- | :---- |
| 1 | productCode | SF, MF or CM for Single Family, Multi-Family or Commercial Building |
| 2 | latitude | Latitude of Property Address |
| 3 | longitude | Longitude of Property Address |

   

   JSON Structure.

   

   {  

     "productCode": "SF",

     "latitude": 48.220860,

     "longitude": \-106.652473

   }

   

      

      2. Response Payload

   

          

| SrNo | Name | Description |
| :---- | :---- | :---- |
| 1 | success | True or False (for covered vs not-covered) |
| 2 | Message | Not covered Message when applicable. |

   

   JSON Structure.

         

         {

             "success": **true**,

             "message": ""

         }

                        OR

   	        {

             "success": **false**,

             "message": "The requested address with latitude 48.22086 and \-106.652473 is not under our coverage area."

         }

   

      

   4. ##  **PartnerDetails ( Pricing / Configuration \- Not needed)** {#partnerdetails-(-pricing-/-configuration---not-needed)}

   The purpose of this endpoint is to allow Partners to check setup/configuration of Partner Account along with Pricing Details. It will return back Partner Code , Status, Callback endpoint details as well Pricing for each of the configured products.

   

      1. Request Payload

      

           No Parameters are required for this request.

      

      2. Response Payload

   

   {

       "subscribers": \[

           {

               "subscriberId": 3,

               "name": "Partner",

               "status": 1,

               "createdOn": "2020-12-08T01:00:04.503",

               "createdBy": "system",

               "modifiedOn": **null**,

               "modifiedBy": **null**,

               "subscriberConfiguration": \[

                   {

                       "subscriberConfigurationId": 3,

                       "subscriberId": 3,

                       "key": "CallBackEndPoint",

                       "value": "https://partnerapi.com/api/progressapi/api/v1/Registration/sendupdate",

                       "status": 1,

                       "createdOn": "2020-12-08T01:00:04.503",

                       "createdBy": "system",

                       "modifiedOn": **null**,

                       "modifiedBy": **null**

                   }

               \],

               "subscriberProduct": \[

                   {

                       "subscriberProductId": 7,

                       "subscriberId": 3,

                       "productId": 1,

                       "productCode": "SF",

                       "status": 1,

                       "createdOn": "2020-12-08T01:00:04.503",

                       "createdBy": "system",

                       "modifiedOn": **null**,

                       "modifiedBy": **null**,

                       "price": 25.00

                   },

                   {

                       "subscriberProductId": 8,

                       "subscriberId": 3,

                       "productId": 2,

                       "productCode": "MF",

                       "status": 1,

                       "createdOn": "2020-12-08T01:00:04.503",

                       "createdBy": "system",

                       "modifiedOn": **null**,

                       "modifiedBy": **null**,

                       "price": 75.00

                   },

                   {

                       "subscriberProductId": 9,

                       "subscriberId": 3,

                       "productId": 3,

                       "productCode": "CM",

                       "status": 1,

                       "createdOn": "2020-12-08T01:00:04.503",

                       "createdBy": "system",

                       "modifiedOn": **null**,

                       "modifiedBy": **null**,

                       "price": 75.00

                   }

               \]

           }

       \]

   }

   

   

   5. ##  **Account Check** {#account-check}

   The purpose of this endpoint is to allow Partners to validate Customer Account with GAF system. 

      

      1. Request Payload

      

      Email Address is required to be passed for this request.

      The email address needs to be passed as a base64 encoded string.

      E.g. [mikeroofer6@gaf-mnrgmail.com](mailto:mikeroofer6@gaf-mnrgmail.com) should be sent as bWlrZXJvb2ZlcjZAZ2FmLW1ucmdtYWlsLmNvbQ==

      Try out at [https://www.base64encode.org/](https://www.base64encode.org/)

      

      

      2. Response Payload

      

        {

          "emailAddress": "mikeroofer6@GAF-MNRgmail.com",

          "firstName": "Mikes",

          "lastName": "Roof",

          "parentEmailAddress": "mikeroofer6@GAF-MNRgmail.com",

          "availableCredits": 0.00,

          "gafCustomerID": 1121236,

          "gafCustomerName": "M\&R roofing",

          "gafCustomerAddress": "133 Highlands Dr, Woodstock, GA 30188",

          "address1": "133 Highlands Dr",

          "city": "Woodstock",

          "state": "GA",

          "postalCode": "30188",

          "country": "USA",

          "currentProfile": "ME",

          "qualifiedProfile": "ME",

          "success": **true**,

          "products": \[

              {

                  "code": "SF",

                  "description": "Single family",

                  "price": 18.0000

              },

              {

                  "code": "MF",

                  "description": "Multi-family",

                  "price": 54.0000

              },

              {

                  "code": "CM",

                  "description": "Commercial",

                  "price": 54.0000

              }

          \]

      }

      

    


   6. ##  **Available Products** {#available-products}

   Following is the list of products available for order. The old product codes SF,MF and CM are still valid, but if you plan to upgrade to new products, then please use the new codes for QM (e.g. SF-QM-USA, MF-QM-USA and CM-QM-USA)

   

   

   

| PropertyType | PropertyType Description | ProductCode | ProductDescription | Available Services |
| :---- | :---- | :---- | :---- | :---- |
| SF | Single Family | **SF** | Roof Measurement | Roof Measurement |
| MF | Multi Family | **MF** | Roof Measurement | Roof Measurement |
| CM | Commercial | **CM** | Roof Measurement | Roof Measurement |
| SF | Single Family | **SF-QM-USA** | Roof Measurement | Roof Measurement |
| MF | Multi Family | **MF-QM-USA** | Roof Measurement | Roof Measurement |
| CM | Commercial | **CM-QM-USA** | Roof Measurement | Roof Measurement |
| SF | Single Family | **SF-QS-USA** | Add On Building Codes & Weather (Formerly QuickSite Report) | Weather History & Property Information Building Codes  |
| MF | Multi Family | **MF-QS-USA** | Add On Building Codes & Weather (Formerly QuickSite Report) | Weather History & Property Information Building Codes  |
| CM | Commercial | **CM-QS-USA** | Add On Design Criteria & Weather (Formerly QuickSite Report) | Weather History & Property Information Design Criteria  |
| SF | Single Family | **SF-QM-CAN** | Roof Measurement | Roof Measurement |
| MF | Multi Family | **MF-QM-CAN** | Roof Measurement | Roof Measurement |
| CM | Commercial | **CM-QM-CAN** | Roof Measurement | Roof Measurement |
| SF | Single Family | **SF-CC–USA** | Insurance Scope of Work | Estimate Report Xactimate of Symbility File |

   

   7. ##  **Request Report** {#request-report}

   	The purpose of this endpoint is to allow Partners to request a report.

   

      1. Request Payload

   

   

| SrNo | Parameter | Sample value | Mandatory | Comments |
| :---- | :---- | :---- | :---- | :---- |
| 1 | subscriberName | Partner | Yes | Partner Name |
| 2 | subscriberOrderNumber | Partner Order Number | No | This will be used for reconciliation purpose for cross referencing or |
| 3 | subscriberCustomField1 | Partner Custom Field | No | This is an additional field to be provided by the partner for any additional information. |
| 4 | emailAddress | Valid Email Address  | Yes | This field will be used to find the matching account on GAF system and link order to that account (if available)  |
| 5 | recipientEmailAddresses | joe@Partner.com,mark@Partner.com | No | Optional field to provide recipients email addresses |
| 6 | products |  | Yes | Array of Products to be ordered **(right now only 1 at at time supported)** |
| 7 | products.productcode | SF-QM-USA | Yes | Product code from section 6.6 |
| 8 | products.additionalinformation | Additional information (list of question answers from integration sheet) | No | Only required for SF-CC-USA product, for rest it can be null |
| 6 | instructions | Please include attached Garage | No | Any additional instructions to be optionally provided which can help in better accuracy of roof measurement report. |
| 7 | address1  | 3530 Tuxedo Park NW | Yes | Mandatory field for providing address details |
| 8 | address2  |  | No | Optional field for additional address details |
| 9 | city  | Atlanta | Yes | Mandatory field for providing address details |
| 10 | stateOrProvince  | GA | Yes | Mandatory field for providing address details |
| 11 | postalCode  | 30305 | Yes | Mandatory field for providing address details |
| 12 | county  |  | No | Optional field for providing address details |
| 13 | fipscode  |  | No | Mandatory field for providing address details |
| 14 | country  | USA | Yes | Mandatory field for providing address details |
| 15 | latitude  | 33.85198 | Yes | Mandatory field for providing geographical details |
| 16 | longitude  | \-84.402908 | Yes | Mandatory field for providing geographical details |
| 17 | fullAddress  | 3530 Tuxedo Park NW, Atlanta, GA 30305, USA | Yes | Mandatory field to ensure that address validation was done before providing the details. |
| 18 | checkForDuplicate | True or False | No | Default false. Only if a duplicate order check is required. |
|  |  |  |  |  |

   

   

         **Validation Errors.**

| SrNo | Error Code | Description | Always has Value | Comments |
| :---- | :---- | :---- | :---- | :---- |
| 1 | 00 | One or more mandatory fields are missing in your request | No | Returned Only if the input payload has missing attributes. |
| 2 | 03 | Please enter a valid product code. | No | Returned only if invalid product code is supplied. |
| 3 | 04 | Please enter a valid address. One or more address fields are missing or not valid. | No | Returned when some of the mandatory address fields are missing. |
| 4 | 05 | The requested address is not under our coverage area | No | Returns when the provided address is not under coverage area. |
| 5 | 06 | Please enter a valid subscriber name | No | Returned when invalid subscriber is provided. |
| 6 | HTTP Response codes | 401 for invalid access token or expired access token | No | Returned when invalid access token is provided. |
|  |  |  |  |  |

**JSON Structure**

**{**  
    **"subscriberName": "Partner",**  
    **"subscriberOrderNumber": "Partner-001",**  
    **"subscriberCustomField1": "Partner-Custom123",**  
    **"emailAddress": "accounting@gaf-mnrjamarroofing.com",**  
    **"products": \[**  
  **{**  
    **"productCode": "SF-CC-USA",**  
    **"additionalInformation": \[**  
      **{**  
        **"questioncode": "Q1",**  
        **"question": "Which file format would you like ?",**  
        **"answer": "Xactimate"**  
      **},**  
      **{**  
        **"questioncode": "Q28",**  
        **"question": "Company Name to Show on Scope",**  
        **"answer": "GAF"**  
      **},**  
      **{**  
        **"questioncode": "Q19",**  
        **"question": "Insurance Company (optional)",**  
        **"answer": "GEICO"**  
      **},**  
      **{**  
        **"questioncode": "Q20",**  
        **"question": "Claim Number (optional)",**  
        **"answer": "1234567890"**  
      **},**  
**{**  
        **"questioncode": "Q55",**  
        **"question": "Your Contact Number (Optional)",**  
        **"answer": "9731234567"**  
      **},**

      **{**  
        **"questioncode": "Q2",**  
        **"question": "What is the current roofing material?",**  
        **"answer": "Architectural Asphalt "**  
      **},**  
      **{**  
        **"questioncode": "Q47",**  
        **"question": "What are you installing on the roof?",**  
        **"answer": "Three Tab Asphalt "**  
      **},**  
      **{**  
        **"questioncode": "Q3",**  
        **"question": "If not required by codes, add Ice and water shield to  Scope of Work?",**  
        **"answer": "Eaves and Valleys"**  
      **},**  
      **{**  
        **"questioncode": "Q4",**  
        **"question": "If not required by codes, add drip edge to Scope of Work?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q48",**  
        **"question": "Should this be written to FORTIFIED Standards?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q36",**  
        **"question": "Is Redeck needed?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q51",**  
        **"question": "What type of Redeck is needed?",**  
        **"answer": "OSB 1/2"**  
      **},**  
      **{**  
        **"questioncode": "Q5",**  
        **"question": "Ridge Vent",**  
        **"answer": "100"**  
      **},**  
      **{**  
        **"questioncode": "Q6",**  
        **"question": "Box Vent",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q7",**  
        **"question": "Gable Vent",**  
        **"answer": "2"**  
      **},**  
      **{**  
        **"questioncode": "Q8",**  
        **"question": "Trad. Power Vent",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q9",**  
        **"question": "Solar Power Vent",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q10",**  
        **"question": "Other",**  
        **"answer": "OTHER VENT"**  
      **},**  
 **{**  
        **"questioncode": "Q54",**  
        **"question": "Exhaust Vent",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q29",**  
        **"question": "Lead Pipe Boot",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q30",**  
        **"question": "Rubber Pipe Boot",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q31",**  
        **"question": "Split Boot",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q11",**  
        **"question": "Chimney",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q32",**  
        **"question": "Skylight (Flashing Kit Only)",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q33",**  
        **"question": "Skylight (Full Replacement)",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q34",**  
        **"question": "What material is in the Valleys?",**  
        **"answer": "Closed \- Metal"**  
      **},**  
**{**  
        **"questioncode": "Q53",**  
        **"question": "If you would like permit cost in the Scope of Work, please enter it below",**  
        **"answer": "100"**  
      **},**

      **{**  
        **"questioncode": "Q16",**  
        **"question": "Shingle Layers",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q35",**  
        **"question": "Felt/Underlayment Layers",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q52",**  
        **"question": "Wood Shake/Wood Shingle Layers",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q21",**  
        **"question": "Add gutters to Scope of Work?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q22",**  
        **"question": "What type of gutters are currently on the house?",**  
        **"answer": "Aluminium"**  
      **},**  
      **{**  
        **"questioncode": "Q23",**  
        **"question": "What is the size of gutters?",**  
        **"answer": "5"**  
      **},**  
      **{**  
        **"questioncode": "Q24",**  
        **"question": "What is the size of the downspouts?",**  
        **"answer": "2x3"**  
      **},**  
      **{**  
        **"questioncode": "Q25",**  
        **"question": "What is the linear feet(LF) of the gutters and downspouts?",**  
        **"answer": "1, 1"**  
      **},**  
      **{**  
        **"questioncode": "Q27",**  
        **"question": "Are there additional accessories installed on the gutters?",**  
        **"answer": "MIS ACCESSORIES"**  
      **},**  
      **{**  
        **"questioncode": "Q49",**  
        **"question": "Is there a solar on the roof?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q37",**  
        **"question": "Should solar panels be detached and reset?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q38",**  
        **"question": "Solar Panels",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q39",**  
        **"question": "Mounts",**  
        **"answer": "1"**  
      **},**  
      **{**  
        **"questioncode": "Q50",**  
        **"question": "Is there a low slope component on the roof?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q40",**  
        **"question": "Is Modified Bitumen Present?",**  
        **"answer": "Peel and Stick"**  
      **},**  
      **{**  
        **"questioncode": "Q41",**  
        **"question": "Is there a metal roof present?",**  
        **"answer": "Yes"**  
      **},**  
      **{**  
        **"questioncode": "Q42",**  
        **"question": "What type of metal roof is present?",**  
        **"answer": "Standing Seam"**  
      **},**  
      **{**  
        **"questioncode": "Q43",**  
        **"question": "What gauge of metal?",**  
        **"answer": "26"**  
      **},**  
      **{**  
        **"questioncode": "Q44",**  
        **"question": "What type of finish are present?",**  
        **"answer": "Color"**  
      **},**  
      **{**  
        **"questioncode": "Q45",**  
        **"question": "Include trim metal?",**  
        **"answer": "Rack Gable Trim"**  
      **},**  
      **{**  
        **"questioncode": "Q46",**  
        **"question": "If underlayment is required, which type?",**  
        **"answer": "Synthetic Felt"**  
      **},**  
      **{**  
        **"questioncode": "Q26",**  
        **"question": "How many splash guards are currently on the house?",**  
        **"answer": "1"**  
      **}**  
    **\]**  
  **}**  
**\],**  
    **"address1": "4610 Drexel Ave",**  
    **"address2": "",**  
    **"city": "Minneapolis",**  
    **"stateOrProvince": "MN",**  
    **"postalCode": "55424",**  
    **"fipscode": "Fips Code",**  
    **"county": "",**  
    **"country": "USA",**  
    **"latitude": "44.9157619",**  
    **"longitude": "-93.3389659",**  
    **"fullAddress": "4610 Drexel Ave, Minneapolis, MN 55424, USA",**  
    **"recipientEmailAddresses": "test@mail.com",**  
    **"instructions": "",**  
    **"checkForDuplicate": false**  
**}**

2. Response Payload

 


| SrNo | Parameter | Sample value | Always has Value | Comments |
| :---- | :---- | :---- | :---- | :---- |
| 1 | gafordernumber | 1001 | Yes | Returns order id for the placed order. |
| 2 | subscriberordenumber | Partner Order Number | No | Only if it was passed in request |
| 3 | orderdatetime | 2020-12-04 13:15:03.140 | No | Only if the order was successfully placed, then it will have value. |
| 3 | success | true | Yes | true or false, determines if the operation was successful or failure. |
| 4 | errors | errorCode : “01” errorMessage : “Please enter a valid address.” | No | Returns a collection of errors if success is false along with error code and descriptions |
|  |  |  |  |  |

   

          Sample response payload in JSON :

            {  
    "GAFOrderNumber": 85716,  
    "subscriberOrderNumber": ‘Partner-123’,  
    “orderDateTime": ‘2020-12-04 13:15:03.140’,  
    "success": true,  
    "errors": \[\],

}

8. ## **Receive Report (Success) \- Quick Measure** {#receive-report-(success)---quick-measure}

   The purpose of this endpoint is to allow Partners to receive a report (success).  

                        The callback endpoint is provided by GAF Partner vendors.

1. Request Payload

   {

       "SubscriberOrderNumber": "Partner-001",

       "GAFOrderNumber": 1790771,

       "SubscriberCustomField1": "Partner-Custom",

       "Subscriber": "Partner",

       "SubscriberReference": "2ae070aef44240258d3fac54e0e71597",

       "Vendor": **null**,

       "VendorReference": **null**,

       "RoofMeasurement": {

           "Area": 1828,

           "Eaves": 190,

           "Hips": 0,

           "Rakes": 0,

           "Ridges": 0,

           "Valleys": 0,

           "Facets": 1,

           "Pitch": "0/12",

           "Assets": {

               "Report": "report\_4b5174c0192e4ecdaa42b9111953f2b5.pdf",

               "Cover": "cover\_4b5174c0192e4ecdaa42b9111953f2b5.pdf",

               "Diagram": "diagram\_4b5174c0192e4ecdaa42b9111953f2b5.pdf",

               "Acculynx": "xml\_4b5174c0192e4ecdaa42b9111953f2b5.xml",

               "HomeownerReport": "homeownerreport\_4b5174c0192e4ecdaa42b9111953f2b5.pdf",

               "Report3D": "https://eave-frontend-development.appspot.com/report?taskId=6699893969342617",

               "DxfUrl": "dxf\_4b5174c0192e4ecdaa42b9111953f2b5.dxf",

               "VerticalImage": "verticalimage\_4b5174c0192e4ecdaa42b9111953f2b5.jpg",

               "NorthImage": "northimage\_4b5174c0192e4ecdaa42b9111953f2b5.jpg",

               "EastImage": "eastimage\_4b5174c0192e4ecdaa42b9111953f2b5.jpg",

               "SouthImage": "southimage\_4b5174c0192e4ecdaa42b9111953f2b5.jpg",

               "WestImage": "westimage\_4b5174c0192e4ecdaa42b9111953f2b5.jpg"

           },

           "Bends": 0,

           "Flash": 0,

           "Step": 0,

           "DripEdge": 190,

           "LeakBarrier": 0,

           "RidgeCap": 0,

           "Starter": 0,

           "Parapets": 0,

           "CobraExhaustVentFeet": **null**,

           "CobraIntakeVentFeet": **null**,

           "DeckArmorRolls": **null**,

           "HoleArea": **null**,

           "HoleCount": **null**,

           "HolePerimeter": **null**,

           "LibertyBaseRolls": **null**,

           "LibertyCapRolls": **null**,

           "MasterFlowDomeVents": **null**,

           "MasterFlowLouverVents": **null**,

           "ProStartBundles": **null**,

           "QuickStartRolls": **null**,

           "SealARidgeBundles": **null**,

           "ShingleMateRolls": **null**,

           "StormGuardRolls": **null**,

           "SuggestedWaste": **null**,

           "TimberCrestBoxes": **null**,

           "TimberlineBundles": **null**,

           "TimberTexBundles": **null**,

           "VersaShieldRolls": **null**,

           "WeatherBlockerBundles": **null**,

           "WeatherWatchRolls": **null**,

           "ZRidgeBundles": **null**,

           "PitchToArea": "{  \\"0\\": 1828.395090218697}",

           "Buildings": "\[  {    \\"acculynxUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617.xml\\",    \\"address\\": \\"4610 Drexel Ave, Minneapolis, MN 55424\\",    \\"area\\": 1828,    \\"bends\\": 0,    \\"buildings\\": \[\],    \\"capNailBoxes\\": 0.9141975451093486,    \\"cobraExhaustVentHandNailableFeet\\": 0.0,    \\"cobraExhaustVentNailGunnableFeet\\": 0.0,    \\"cobraHipVentFeet\\": 0.0,    \\"cobraIntakeVentFeet\\": 0.0,    \\"cobraRidgeRunnerFeet\\": 0.0,    \\"cobraRidgeVentFeet\\": 0.0,    \\"coilNailBoxes\\": 0.9141975451093486,    \\"coverUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617-cover.pdf\\",    \\"deckArmorRolls\\": 0.0,    \\"diagramUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617-diagram.pdf\\",    \\"done\\": true,    \\"dripEdge\\": 190,    \\"dxfUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617.dxf\\",    \\"eastImageUrl\\": \\"https://eave-frontend-development.appspot.com/api/getimage?latitude=44.9157619\&longitude=-93.3389659\&sizeMeters=40\&type=East\&zoom=21\\",    \\"eaves\\": 190,    \\"eightFootDripEdgePieces\\": 23.743001750362282,    \\"eightFootStepFlashingPieces\\": 0.0,    \\"facets\\": 1,    \\"flash\\": 0,    \\"hips\\": 0,    \\"holeArea\\": 0,    \\"holeCount\\": 0,    \\"holePerimeter\\": 0,    \\"homeownerUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617-homeowner.pdf\\",    \\"leakBarrier\\": 0,    \\"libertyBaseRolls\\": 0.0,    \\"libertyCapRolls\\": 0.0,    \\"masterFlow12InchWindTurbines\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlow14InchWindTurbines\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowDomeVents\\": 0.0,    \\"masterFlowErv4Vents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowErv5Vents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowErv6Vents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowEzCoolVents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowGreenMachine1Vents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowGreenMachine2Vents\\": {      \\"cobraIntakeVentFeet\\": 0.0,      \\"exhaustVents\\": 0.0,      \\"masterFlowIntakeVents\\": 0.0    },    \\"masterFlowIntakeVents\\": 0.0,    \\"masterFlowMetalBackVents\\": 0.0,    \\"masterFlowPlasticBackVents\\": 0.0,    \\"masterFlowRidgeVentFeet\\": 0.0,    \\"masterFlowTopVents\\": 0.0,    \\"modelUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617-metrics.json\\",    \\"northImageUrl\\": \\"https://eave-frontend-development.appspot.com/api/getimage?latitude=44.9157619\&longitude=-93.3389659\&sizeMeters=40\&type=North\&zoom=21\\",    \\"parapets\\": 0,    \\"pitch\\": 0,    \\"pitchToArea\\": {      \\"0\\": 1828.395090218697    },    \\"proStartBundles\\": 0.0,    \\"quickStartRolls\\": 0.0,    \\"rakes\\": 0,    \\"reportUrl\\": \\"https://storage.googleapis.com/eave-frontend-development/6699893969342617.pdf\\",    \\"ridgeCap\\": 0,    \\"ridges\\": 0,    \\"sealARidgeBundles\\": 0.0,    \\"shingleMateRolls\\": 0.0,    \\"southImageUrl\\": \\"https://eave-frontend-development.appspot.com/api/getimage?latitude=44.9157619\&longitude=-93.3389659\&sizeMeters=40\&type=South\&zoom=21\\",    \\"starter\\": 0,    \\"step\\": 0,    \\"stormGuardRolls\\": 0.0,    \\"suggestedWaste\\": 105,    \\"taskId\\": 6699893969342617,    \\"tenFootDripEdgePieces\\": 18.994401400289824,    \\"tenFootStepFlashingPieces\\": 0.0,    \\"timberCrestBoxes\\": 0.0,    \\"timberlineBundles\\": 0.0,    \\"timberTexBundles\\": 0.0,    \\"valleys\\": 0,    \\"versaShieldRolls\\": 0.0,    \\"verticalImageUrl\\": \\"https://eave-frontend-development.appspot.com/api/getimage?latitude=44.9157619\&longitude=-93.3389659\&sizeMeters=40\&type=Vert\&zoom=21\\",    \\"weatherBlockerBundles\\": 0.0,    \\"weatherWatchRolls\\": 0.0,    \\"westImageUrl\\": \\"https://eave-frontend-development.appspot.com/api/getimage?latitude=44.9157619\&longitude=-93.3389659\&sizeMeters=40\&type=West\&zoom=21\\",    \\"zRidgeBundles\\": 0.0  }\]"

       },

       "AdditionalProduct": **null**,

       "TrackingId": "9b77ee2d-8982-42df-9cf6-df32c64086e3",

       "ServerResponses": **null**,

       "ProblemCode": **null**

   }

   

   

   

   

   

   

   

   

   2. Response Payload

      

   9. ##  **Receive Report Failure ( QuickMeasure)** {#receive-report-failure-(-quickmeasure)}

   The purpose of this endpoint is to allow Partners to receive a report (failure).  

                        The callback endpoint is provided by GAF Partner vendors.

1. Request Payload

   

   {

     "SubscriberOrderNumber": "92e41a23-9d27-4c56-9eb7-3a3271bf0c83",

     "GAFOrderNumber": 1344277,

     "SubscriberCustomField1": "",

     "Subscriber": "Partner",

     "SubscriberReference": "c0ed1080bbd8464084f8726a97c6e6a3",

     "Vendor": null,

     "VendorReference": null,

     "RoofMeasurement": null,

     "AdditionalProducts": null,

     "TrackingId": "16ed4dfa-fb41-4d4d-9eab-f320e18c28a7",

     "ServerResponses": null,

     "ProblemCode": "ambiguous marker"

   }

   

   

   

   2. Standard Error Codes

           

            Please find the standard list of error codes mentioned [here.](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link)

   

      3. Response Payload

   ## 

   10. ##  **Receive Report (Success) \- Add on (Formerly QuickSite)** {#receive-report-(success)---add-on-(formerly-quicksite)}

   The purpose of this endpoint is to allow Partners to receive a report (success).  

                        The callback endpoint is provided by GAF Partner vendors.  
    {  
    "SubscriberOrderNumber": "Partner-001",  
    "GAFOrderNumber": 1790918,  
    "SubscriberCustomField1": "Partner-Custom",  
    "Subscriber": "Partner",  
    "SubscriberReference": "ca3cf254c57b45f1b156dd3990de4a58",  
    "Vendor": **null**,  
    "VendorReference": **null**,  
    "RoofMeasurement": **null**,  
    "AdditionalProduct": {  
        "ProductCode": "SF-QS-USA",  
        "Report": "6f5a9814-d78d-4687-97a8-c9f1b2ba9b94\_cover.pdf",  
        "Assets": \[  
            {  
                "ServiceCode": "BC",  
                "Report": "SF-BC-USA-c458b2bd-fb06-45fd-bc8e-214b29c31b3c.pdf"  
            },  
            {  
                "ServiceCode": "RC",  
                "Report": "SF-RC-USA-0954d144-294e-4241-ba5c-7f2efc5699fc.pdf"  
            },  
            {  
                "ServiceCode": "WHPI",  
                "Report": "SF-WHPI-USA-3e4a7014-9fdf-4384-b4aa-2eef01dab4b2.pdf"  
            }  
        \],  
        "Errors": **null**  
    },  
    "TrackingId": "64aed8a6-ed85-49d1-8352-6a59284f151c",  
    "ServerResponses": **null**,  
    "ProblemCode": **null**  
}

11. ##  **Receive Report (Failure) \- Add on (Formerly QuickSite)** {#receive-report-(failure)---add-on-(formerly-quicksite)}

    The purpose of this endpoint is to allow Partners to receive a report (failure).  

                        The callback endpoint is provided by GAF Partner vendors.

{  
  "SubscriberOrderNumber": "92e41a23-9d27-4c56-9eb7-3a3271bf0c83",  
  "GAFOrderNumber": 1344277,  
  "SubscriberCustomField1": "",  
  "Subscriber": "Partner",  
  "SubscriberReference": "c0ed1080bbd8464084f8726a97c6e6a3",  
  "Vendor": null,  
  "VendorReference": null,  
  "RoofMeasurement": null,  
  "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": null,  
      "Assets": null,  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        },  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "BC"  
        },  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "WHPI"  
        }  
      \]  
    }  
  \],  
  "TrackingId": "16ed4dfa-fb41-4d4d-9eab-f320e18c28a7",  
  "ServerResponses": null,  
  "ProblemCode": "ambiguous marker"  
}

12. ## **Receive Report (Success) \-  ScopeConnect** {#receive-report-(success)---scopeconnect}

    The purpose of this endpoint is to allow Partners to receive a report (success).  

                        The callback endpoint is provided by GAF Partner vendors.  
       {  
   "SubscriberOrderNumber":"abc@gaftest.com",  
   "GAFOrderNumber":2470323,  
   "SubscriberCustomField1":"8514 Cottonwood Dr E, Meridian, MS 39305, USA",  
   "Subscriber":"GAFMobile",  
   "SubscriberReference":null,  
   "Vendor":null,  
   "VendorReference":null,  
   "RoofMeasurement":null,  
   "AdditionalProduct":{  
      "ProductCode":"SF-CC-USA",  
      "Report":"SF-CC-USA-5c6ce831-f58b-4efc-ada0-6846877546e6.esx",  
      "Assets":null,  
      "Errors":null  
   },  
   "TrackingId":"f77ff435-24c4-4ff4-a9aa-5e6d10f9b5e6",  
   "ServerResponses":null,  
   "ProblemCode":null  
}

OR

{  
   "SubscriberOrderNumber":"abc@gaftest.com",  
   "GAFOrderNumber":2437341,  
   "SubscriberCustomField1":"507 Sabine Dr, Crandall, TX 75114, USA",  
   "Subscriber":"GAFMobile",  
   "SubscriberReference":null,  
   "Vendor":null,  
   "VendorReference":null,  
   "RoofMeasurement":null,  
   "AdditionalProduct":{  
      "ProductCode":"SF-CC-USA",  
      "Report":"2e70fbb9-8951-4945-9658-0fbe70809774\_cover.pdf",  
      "Assets":null,  
      "Errors":null  
   },  
   "TrackingId":"d25e12bd-9855-4e00-878b-5f605ed1feac",  
   "ServerResponses":null,  
   "ProblemCode":null  
}

13. ## **Receive Report (Failure ) \-  ScopeConnect** {#receive-report-(failure-)---scopeconnect}

    The purpose of this endpoint is to allow Partners to receive a report (success).  

                        The callback endpoint is provided by GAF Partner vendors.  
       {  
    "SubscriberOrderNumber": "Partner-001",  
    "GAFOrderNumber": 1790918,  
    "SubscriberCustomField1": "Partner-Custom",  
    "Subscriber": "Partner",  
    "SubscriberReference": "ca3cf254c57b45f1b156dd3990de4a58",  
    "Vendor": **null**,  
    "VendorReference": **null**,  
    "RoofMeasurement": **null**,  
    "AdditionalProduct": {  
        "ProductCode": "SF-CC-USA",  
        "Report": null,  
        "Assets": null  
          "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "ER"  
        }  
      \]

    },  
    "TrackingId": "64aed8a6-ed85-49d1-8352-6a59284f151c",  
    "ServerResponses": **null**,  
    "ProblemCode": **null**  
}

14. ##  **Download Report Assets** {#download-report-assets}

    The purpose of this endpoint is to allow Partners to download assets related to a report based on reference number.

    

    1. Request Payload

    

              

| SrNo | Name | Sample Value |
| :---- | :---- | :---- |
| 1 | FileName | report\_b7153fba20eb4572bf251b2232e47efc.pdf |

    

       2. Response Payload

       

             Document will be streamed back as stream.

    15. ##  **Download Report Assets** {#download-report-assets-1}

    The purpose of this endpoint is to allow Partners to download assets related to a report based on reference number.

    

        1. Request Payload

    

              

| SrNo | Name | Sample Value |
| :---- | :---- | :---- |
| 1 | FileName | report\_b7153fba20eb4572bf251b2232e47efc.pdf |

    

        2. Response Payload

        

              Document will be streamed back as stream.

        

    16. ##  **Receive Report (Request History)** {#receive-report-(request-history)}

    The purpose of this endpoint is to allow Partners to search for reports based on different search criteria (report requested dates, GAF Order Number, Partner Order Number)

    

        1. Request Payload

  


| SrNo | Parameter | Sample value | Always has Value | Comments |
| :---- | :---- | :---- | :---- | :---- |
| 1 | searchBy | **Subscriber** | Yes | Must have the exact value as mentioned. |
| 2 | searchText | **Partner** | Yes | Must have the exact value as mentioned. |
| 3 | GAFOrderNumber | 8712 | No | Only if search needs to be provided based on GAF Order Number |
| 4 | SubscriberOrderNumber | Partner-123 | No | Only if search needs to be provided based on Subscriber Order Number |
| 5 | SubscriberAccountEmailAddress | joe@Partner.com | No | Only if search needs to be provided based on Email Address |
| 6 | SubscriberCustomField1 | Partner-Custom | No | Only if search needs to be provided based on Subscriber Custom Field1 |
| 7 | FullAddress | 3530 Tuxedo | No | Only if search needs to be provided based on Address field |
| 8 | FromDate | 1/1/2020 | No | Only if search needs to be provided based on date |
| 9 | ToDate | 1/31/2020 | No | Only if search needs to be provided based on date |
| 10 | success | true | Yes | true or false, determines if the operation was successful or failure. |
| 11 | errors | errorCode : “01” errorMessage : “Please enter a valid address.” | No | Returns a collection of errors if success is false along with error code and descriptions |
|  |  |  |  |  |

    

    

    There are different variations of Order History Search to search by different parameters for different use-cases. Following are different samples from the GAF Dev environment. (for testing in any other environments based on Partnerattributes (PartnerOrder Number, PartnerCustom Field, you will have to create data by placing orders with desired values before searching them)

      


        2. Search All PartnerOrders

              

              Following is an example from GAF Development environment (for other environments please use email addresses based on the environment from the integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link). Just pasting limited orders in Response payload to save space in this document.

        

        

        

        **Request Payload**

              

        {

          "searchBy": "Subscriber",

          "searchText": "Partner",

          "fullAddress": "",

          "gafOrderNumber": "",

          "subscriberOrderNumber": "",

          "subscriberAccountEmailAddress": "",

          "subscriberCustomField1": "",

          "applyPaging": **true**,

          "applyFilter": **true**,

          "applySearch": **true**,

          "paging": {

            "pageNo": 1,

            "pageSize": 100,

            "totalPages": 0,

            "totalRecords": 0,

            "token": ""

          },

          "filter": {

            "fromDate": "",

            "toDate": "",

            "viewBy": 0

          },

          "sortBy": "",

          "sortOrder": ""

        }

        

		**Response Payload**

		**{**  
    "message": null,  
    "success": true,  
    "errorCode": null,  
    "paging": {  
        "pageNo": 1,  
        "pageSize": 100,  
        "totalPages": 9,  
        "totalRecords": 843,  
        "token": null  
    },  
    "sortBy": null,  
    "sortOrder": null,  
    "result": \[  
        {  
            "orderId": 299028,  
            "userId": 9935,  
            "gafcustomerId": null,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "401 N 27th St",  
            "address2": "",  
            "city": "Billings",  
            "stateOrProvince": "MT",  
            "postalCode": "59101",  
            "fipscode": null,  
            "county": null,  
            "latitude": 40.046944433791765,  
            "longitude": \-75.67226574511425,  
            "isValidAddress": 1,  
            "fullAddress": "401 N 27th St, Billings, MT 59101, USA",  
            "orderStatus": "Pending",  
            "orderRequestedOn": "2021-01-21T19:42:09.317",  
            "orderRespondedOn": null,  
            "recipientEmailAddresses": "test@mail.com,  test@Partnersupply.com",  
            "instructions": "There are short instructions",  
            "reportReferenceNumber": "80f79fc48e1340028fab6a1cda34a9b9",  
            "reportMetaData": null,  
            "reportErrorDetails": null,  
            "isLate": 0,  
            "AcculynxUrl": null,  
            "coverUrl": null,  
            "diagramUrl": null,  
            "modelUrl": null,  
            "reportUrl": null,  
            "baseReportUrl": null,  
             "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],

            "createdBy": "test@gaf.com",  
            "createdOn": "2021-01-21T19:41:54.703",  
            "modifiedBy": null,  
            "modifiedOn": null,  
            "refOrderNo": null,  
            "emailAddress": "test@gaf.com",  
            "rejectRequestedOn": null,  
            "rejectReason": null,  
            "rejectedBy": null,  
            "transactionId": null,  
            "subscriberOrderNumber": "120",  
            "subscriberCustomField1": "21323423",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": null  
        }  
   \]  
}

3. Search All Orders by an Email Address

         

         Following is an example from GAF Development environment (for other environments please use email addresses based on the environment from the integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link). Just pasting limited orders in Response payload to save space in this document.

   

   

   **Request Payload**

         

   {

     "searchBy": "Subscriber",

     "searchText": "Partner",

     "fullAddress": "",

     "gafOrderNumber": "",

     "subscriberOrderNumber": "",

     "subscriberAccountEmailAddress": "accounting@gaf-mnrjamarroofing.com",

     "subscriberCustomField1": "",

     "applyPaging": **true**,

     "applyFilter": **true**,

     "applySearch": **true**,

     "paging": {

       "pageNo": 1,

       "pageSize": 100,

       "totalPages": 0,

       "totalRecords": 0,

       "token": ""

     },

     "filter": {

       "fromDate": "",

       "toDate": "",

       "viewBy": 0

     },

     "sortBy": "",

     "sortOrder": ""

   }

   

   

		**Response Payload**

		{  
    "message": null,  
    "success": true,  
    "errorCode": null,  
    "paging": {  
        "pageNo": 1,  
        "pageSize": 100,  
        "totalPages": 1,  
        "totalRecords": 17,  
        "token": null  
    },  
    "sortBy": null,  
    "sortOrder": null,  
    "result": \[  
        {  
            "orderId": 285871,  
            "userId": 130,  
            "gafcustomerId": 1000961,  
            "profileId": 1,  
            "subscriberId": null,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "1802 S Church St",  
            "address2": "",  
            "city": "Georgetown",  
            "stateOrProvince": "TX",  
            "postalCode": "78626",  
            "fipscode": null,  
            "county": "Williamson County",  
            "latitude": 30.6284387,  
            "longitude": \-97.67471379999999,  
            "isValidAddress": 1,  
            "fullAddress": "1802 S Church St, Georgetown, TX 78626, USA",  
            "orderStatus": "Refunded",  
            "orderRequestedOn": "2020-12-22T21:45:07.807",  
            "orderRespondedOn": "2020-12-22T21:48:35.323",  
            "recipientEmailAddresses": "accounting@GAF-MNRjamarroofing.com",  
            "instructions": "",  
            "reportReferenceNumber": "994d77309c37407496d1762d01738bd1",  
            "reportMetaData": null,  
            "reportErrorDetails": "obstructed",  
            "isLate": 0,  
            "AcculynxUrl": null,  
            "coverUrl": null,  
            "diagramUrl": null,  
            "modelUrl": null,  
            "reportUrl": null,  
            "baseReportUrl": null,  
	      "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],  
            "createdBy": "accounting@jamarroofing.com",  
            "createdOn": "2020-12-22T21:44:56.453",  
            "modifiedBy": "system",  
            "modifiedOn": "2021-01-15T22:04:31.9",  
            "refOrderNo": null,  
            "emailAddress": "accounting@GAF-MNRjamarroofing.com",  
            "rejectRequestedOn": null,  
            "rejectReason": null,  
            "rejectedBy": null,  
            "transactionId": null,  
            "subscriberOrderNumber": null,  
            "subscriberCustomField1": null,  
            "invoiceSubscriberForOrder": "N",  
            "subscriberOrderAmount": null,  
            "orderAmount": 15.0000,  
            "source": null  
        }

   \]  
}

4. Search Orders by GAF Order Number

         

         Following is an example from GAF Development environment (for other environments please use email addresses based on the environment from the integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link). 

   

   

   **Request Payload**

         

   {

     "searchBy": "Subscriber",

     "searchText": "Partner",

     "fullAddress": "",

     "gafOrderNumber": "299028",

     "subscriberOrderNumber": "",

     "subscriberAccountEmailAddress": "",

     "subscriberCustomField1": "",

     "applyPaging": **true**,

     "applyFilter": **true**,

     "applySearch": **true**,

     "paging": {

       "pageNo": 1,

       "pageSize": 100,

       "totalPages": 0,

       "totalRecords": 0,

       "token": ""

     },

     "filter": {

       "fromDate": "",

       "toDate": "",

       "viewBy": 0

     },

     "sortBy": "",

     "sortOrder": ""

   }

   

   

   

		**Response Payload**

		{  
    "message": **null**,  
    "success": **true**,  
    "errorCode": **null**,  
    "paging": {  
        "pageNo": 1,  
        "pageSize": 100,  
        "totalPages": 1,  
        "totalRecords": 1,  
        "token": **null**  
    },  
    "sortBy": **null**,  
    "sortOrder": **null**,  
    "result": \[  
        {  
            "orderId": 299028,  
            "userId": 9935,  
            "gafcustomerId": **null**,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "401 N 27th St",  
            "address2": "",  
            "city": "Billings",  
            "stateOrProvince": "MT",  
            "postalCode": "59101",  
            "fipscode": **null**,  
            "county": **null**,  
            "latitude": 40.046944433791765,  
            "longitude": \-75.67226574511425,  
            "isValidAddress": 1,  
            "fullAddress": "401 N 27th St, Billings, MT 59101, USA",  
            "orderStatus": "Pending",  
            "orderRequestedOn": "2021-01-21T19:42:09.317",  
            "orderRespondedOn": **null**,  
            "recipientEmailAddresses": "test@mail.com,  test@Partnersupply.com",  
            "instructions": "There are short instructions",  
            "reportReferenceNumber": "80f79fc48e1340028fab6a1cda34a9b9",  
            "reportMetaData": **null**,  
            "reportErrorDetails": **null**,  
            "isLate": 0,  
            "AcculynxUrl": **null**,  
            "coverUrl": **null**,  
            "diagramUrl": **null**,  
            "modelUrl": **null**,  
            "reportUrl": **null**,  
            "baseReportUrl": **null**,  
             "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],  
            "createdBy": "test@gaf.com",  
            "createdOn": "2021-01-21T19:41:54.703",  
            "modifiedBy": **null**,  
            "modifiedOn": **null**,  
            "refOrderNo": **null**,  
            "emailAddress": "test@gaf.com",  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**,  
            "transactionId": **null**,  
            "subscriberOrderNumber": "120",  
            "subscriberCustomField1": "21323423",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": **null**  
        }  
    \]  
}

5. Search Orders by PartnerOrder Number

         

         Following is an example from GAF Development environment (for other environments please use email addresses based on the environment from the integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link). 

   

   

   **Request Payload**

         

   {

     "searchBy": "Subscriber",

     "searchText": "Partner",

     "fullAddress": "",

     "gafOrderNumber": "",

     "subscriberOrderNumber": "Partner-123",

     "subscriberAccountEmailAddress": "",

     "subscriberCustomField1": "",

     "applyPaging": **true**,

     "applyFilter": **true**,

     "applySearch": **true**,

     "paging": {

       "pageNo": 1,

       "pageSize": 100,

       "totalPages": 0,

       "totalRecords": 0,

       "token": ""

     },

     "filter": {

       "fromDate": "",

       "toDate": "",

       "viewBy": 0

     },

     "sortBy": "",

     "sortOrder": ""

   }

   

   

   

   

		**Response Payload**

		{  
    "message": **null**,  
    "success": **true**,  
    "errorCode": **null**,  
    "paging": {  
        "pageNo": 1,  
        "pageSize": 100,  
        "totalPages": 1,  
        "totalRecords": 5,  
        "token": **null**  
    },  
    "sortBy": **null**,  
    "sortOrder": **null**,  
    "result": \[  
        {  
            "orderId": 299010,  
            "userId": 9944,  
            "gafcustomerId": **null**,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "4610 Drexel Ave",  
            "address2": "",  
            "city": "Minneapolis",  
            "stateOrProvince": "MN",  
            "postalCode": "55424",  
            "fipscode": "Fips Code",  
            "county": "",  
            "latitude": 44.9157619,  
            "longitude": \-93.3389659,  
            "isValidAddress": 1,  
            "fullAddress": "4610 Drexel Ave, Minneapolis, MN 55424, USA",  
            "orderStatus": "Success",  
            "orderRequestedOn": "2021-01-20T23:30:10.37",  
            "orderRespondedOn": "2021-01-20T23:31:09.54",  
            "recipientEmailAddresses": "test@mail.com",  
            "instructions": "",  
            "reportReferenceNumber": "1fe3c0ff6e4e4149b69387fab021c24e",  
            "reportMetaData": **null**,  
            "reportErrorDetails": **null**,  
            "isLate": 0,  
            "AcculynxUrl": "Partner\_f6a31fbf12224eaf8894232b4732d21f.xml",  
            "coverUrl": **null**,  
            "diagramUrl": "diagram\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
            "modelUrl": **null**,  
            "reportUrl": "report\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
            "baseReportUrl": "homeownerreport\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
             "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],

            "createdBy": "sgintegrationtest@gafPartnertest.com",  
            "createdOn": "2021-01-20T23:29:54.55",  
            "modifiedBy": **null**,  
            "modifiedOn": **null**,  
            "refOrderNo": **null**,  
            "emailAddress": "sgintegrationtest@gafPartnertest.com",  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**,  
            "transactionId": **null**,  
            "subscriberOrderNumber": "Partner-123",  
            "subscriberCustomField1": "Custom field value",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": **null**  
        }          
    \]  
}

6. Search Orders by Partner Custom Field

         

         Following is an example from GAF Development environment (for other environments please use email addresses based on the environment from the integration [document](https://docs.google.com/spreadsheets/d/1S8C_Ra97PJh4t6hzpT2gsh5T3Y5TuCtJeoQG0zD9TWs/edit?usp=drive_link). 

   

   

   **Request Payload**

         

   {

     "searchBy": "Subscriber",

     "searchText": "Partner",

     "fullAddress": "",

     "gafOrderNumber": "",

     "subscriberOrderNumber": "",

     "subscriberAccountEmailAddress": "",

     "subscriberCustomField1": "Custom field value",

     "applyPaging": **true**,

     "applyFilter": **true**,

     "applySearch": **true**,

     "paging": {

       "pageNo": 1,

       "pageSize": 100,

       "totalPages": 0,

       "totalRecords": 0,

       "token": ""

     },

     "filter": {

       "fromDate": "",

       "toDate": "",

       "viewBy": 0

     },

     "sortBy": "",

     "sortOrder": ""

   }

   

   

   

   

   

		**Response Payload**

		{  
    "message": **null**,  
    "success": **true**,  
    "errorCode": **null**,  
    "paging": {  
        "pageNo": 1,  
        "pageSize": 100,  
        "totalPages": 1,  
        "totalRecords": 16,  
        "token": **null**  
    },  
    "sortBy": **null**,  
    "sortOrder": **null**,  
    "result": \[  
        {  
            "orderId": 299010,  
            "userId": 9944,  
            "gafcustomerId": **null**,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "4610 Drexel Ave",  
            "address2": "",  
            "city": "Minneapolis",  
            "stateOrProvince": "MN",  
            "postalCode": "55424",  
            "fipscode": "Fips Code",  
            "county": "",  
            "latitude": 44.9157619,  
            "longitude": \-93.3389659,  
            "isValidAddress": 1,  
            "fullAddress": "4610 Drexel Ave, Minneapolis, MN 55424, USA",  
            "orderStatus": "Success",  
            "orderRequestedOn": "2021-01-20T23:30:10.37",  
            "orderRespondedOn": "2021-01-20T23:31:09.54",  
            "recipientEmailAddresses": "test@mail.com",  
            "instructions": "",  
            "reportReferenceNumber": "1fe3c0ff6e4e4149b69387fab021c24e",  
            "reportMetaData": **null**,  
            "reportErrorDetails": **null**,  
            "isLate": 0,  
            "AcculynxUrl": "Partner\_f6a31fbf12224eaf8894232b4732d21f.xml",  
            "coverUrl": **null**,  
            "diagramUrl": "diagram\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
            "modelUrl": **null**,  
            "reportUrl": "report\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
            "baseReportUrl": "homeownerreport\_f6a31fbf12224eaf8894232b4732d21f.pdf",  
             "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],  
            "createdBy": "sgintegrationtest@gafPartnertest.com",  
            "createdOn": "2021-01-20T23:29:54.55",  
            "modifiedBy": **null**,  
            "modifiedOn": **null**,  
            "refOrderNo": **null**,  
            "emailAddress": "sgintegrationtest@gafPartnertest.com",  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**,  
            "transactionId": **null**,  
            "subscriberOrderNumber": "Partner-123",  
            "subscriberCustomField1": "Custom field value",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": **null**  
        },  
        {  
            "orderId": 299000,  
            "userId": 9944,  
            "gafcustomerId": **null**,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "4610 Drexel Ave",  
            "address2": "",  
            "city": "Minneapolis",  
            "stateOrProvince": "MN",  
            "postalCode": "55424",  
            "fipscode": "Fips Code",  
            "county": "",  
            "latitude": 44.9157619,  
            "longitude": \-93.3389659,  
            "isValidAddress": 1,  
            "fullAddress": "4610 Drexel Ave, Minneapolis, MN 55424, USA",  
            "orderStatus": "Success",  
            "orderRequestedOn": "2021-01-20T16:50:09.087",  
            "orderRespondedOn": "2021-01-20T16:51:01.513",  
            "recipientEmailAddresses": "test@mail.com",  
            "instructions": "",  
            "reportReferenceNumber": "7f6fc78a68a441b0969d73a8fffbf720",  
            "reportMetaData": **null**,  
            "reportErrorDetails": **null**,  
            "isLate": 0,  
            "AcculynxUrl": "Partner\_1d125264c5234ee2a483030d0a0d011f.xml",  
            "coverUrl": **null**,  
            "diagramUrl": "diagram\_1d125264c5234ee2a483030d0a0d011f.pdf",  
            "modelUrl": **null**,  
            "reportUrl": "report\_1d125264c5234ee2a483030d0a0d011f.pdf",  
            "baseReportUrl": "homeownerreport\_1d125264c5234ee2a483030d0a0d011f.pdf",  
            "createdBy": "sgintegrationtest@gafPartnertest.com",  
            "createdOn": "2021-01-20T16:50:06.96",  
            "modifiedBy": **null**,  
            "modifiedOn": **null**,  
            "refOrderNo": **null**,  
            "emailAddress": "sgintegrationtest@gafPartnertest.com",  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**,  
            "transactionId": **null**,  
            "subscriberOrderNumber": "Partner-123",  
            "subscriberCustomField1": "Custom field value",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": **null**  
        },  
        {  
            "orderId": 298997,  
            "userId": 9935,  
            "gafcustomerId": **null**,  
            "profileId": 41,  
            "subscriberId": 2,  
            "productId": 1,  
            "productDescription": "Single family",  
            "address1": "1 campus drive",  
            "address2": "",  
            "city": "Parsipanny",  
            "stateOrProvince": "NJ",  
            "postalCode": "07054",  
            "fipscode": "Fips Code",  
            "county": "",  
            "latitude": 40.8438012,  
            "longitude": \-74.45970679999999,  
            "isValidAddress": 1,  
            "fullAddress": "1 Campus Dr, Parsippany, NJ 07054, USA",  
            "orderStatus": "Pending",  
            "orderRequestedOn": "2021-01-20T16:45:08.207",  
            "orderRespondedOn": **null**,  
            "recipientEmailAddresses": "test@mail.com",  
            "instructions": "There are short instructions",  
            "reportReferenceNumber": "8d35ea49457a4e6b97c405b94934d517",  
            "reportMetaData": **null**,  
            "reportErrorDetails": **null**,  
            "isLate": 0,  
            "AcculynxUrl": **null**,  
            "coverUrl": **null**,  
            "diagramUrl": **null**,  
            "modelUrl": **null**,  
            "reportUrl": **null**,  
            "baseReportUrl": **null**,  
            "createdBy": "test@gaf.com",  
            "createdOn": "2021-01-20T16:45:06.593",  
            "modifiedBy": **null**,  
            "modifiedOn": **null**,  
            "refOrderNo": **null**,  
            "emailAddress": "test@gaf.com",  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**,  
            "transactionId": **null**,  
            "subscriberOrderNumber": "TestPartner",  
            "subscriberCustomField1": "Custom field value",  
            "invoiceSubscriberForOrder": "Y",  
            "subscriberOrderAmount": 28.0000,  
            "orderAmount": 28.0000,  
            "source": **null**  
        }         
    \]  
}

17. ##  **Receive Report (Request Existing Report)** {#receive-report-(request-existing-report)}

    The purpose of this endpoint is to allow Partners to search for a particular report based on different search criteria (GAF Order Number OR Partner Order Number)

    

    1. Request Payload

  


| SrNo | Parameter | Sample value | Always has Value | Comments |
| :---- | :---- | :---- | :---- | :---- |
| 1 | searchBy | **Subscriber** | Yes | Must have the exact value as mentioned. |
| 2 | searchText | **Partner** | Yes | Must have the exact value as mentioned. |
| 3 | GAFOrderNumber | 8712 | No | Only if search needs to be provided based on GAF Order Number |
| 4 | SubscriberOrderNumber | Partner-123 | No | Only if search needs to be provided based on Subscriber Order Number |
| 5 | SubscriberAccountEmailAddress | joe@Partner.com | No | Only if search needs to be provided based on Email Address |
| 6 | SubscriberCustomField1 | Partner-Custom | No | Only if search needs to be provided based on Subscriber Custom Field1 |
| 7 | FullAddress | 3530 Tuxedo | No | Only if search needs to be provided based on Address field |
| 8 | FromDate | 1/1/2020 | No | Only if search needs to be provided based on date |
| 9 | ToDate | 1/31/2020 | No | Only if search needs to be provided based on date |
| 10 | success | true | Yes | true or false, determines if the operation was successful or failure. |
| 11 | errors | errorCode : “01” errorMessage : “Please enter a valid address.” | No | Returns a collection of errors if success is false along with error code and descriptions |
|  |  |  |  |  |

    

       

       2. Response Payload

    ## 

       {  
            "GAFOrderNumber": 245263,  
            "SubscriberOrderNumber": 245263,   
            "SubscriberCustomField1": 245263,   
            "productDescription": "Single family",  
            "fullAddress": "Full Address",  
            "orderStatus": "Created",  
            "orderRequestedOn": "2020-12-09T16:37:49.55",  
            "orderRespondedOn": **null**,  
            "responseTime": **null**,  
            "recipientEmailAddresses": "test@test.com",  
            "instructions": "There are shrt instructions",  
            "reportErrorDetails": **null**,  
            "AcculynxUrl": **null**,  
            "reportUrl": **null**,  
             "AdditionalProducts": \[  
    {  
      "ProductCode": "SF-QS-USA",  
      "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0\_cover.pdf",  
      "Assets": \[  
        {  
          "ServiceCode": "WHPI",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc0.pdf"  
        },  
        {  
          "ServiceCode": "BC",  
          "Report": "e82cf3b2-ebac-4b17-8392-e2f3def29bc1.pdf"  
        }  
      \],  
      "Errors": \[  
        {  
          "ProblemCode": "error",  
          "ServiceCode": "RC"  
        }  
      \]  
    }  
  \],

            "emailAddress": "psuser99@gaf.com",  
            "baseReportUrl": **null**,  
            "rejectRequestedOn": **null**,  
            "rejectReason": **null**,  
            "rejectedBy": **null**  
        }  
   

7. ## **Postman collection** {#postman-collection}

   The postman collection for all the endpoints along with the endpoint to acquire access token is available [here](http://test) and will be updated as we provision all environments.

8. ##  **API Documentation on Swagger** {#api-documentation-on-swagger}

   The API Documentation on Swagger is located [here.](https://app.swaggerhub.com/apis-docs/orggaf/Digital-Design-Partners-API/1.0)

[image1]: <data:image/png;base64,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>