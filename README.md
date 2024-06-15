
# Identity Reconciliation

A node.js app which create and keeps track of users, merging the together if they already exist.

Repo is currently deployed on https://identity-reconciliation-nabn.onrender.com/identify. Pass the requred data as a JSON body in a POST request.

Example
```sh
curl -X POST https://identity-reconciliation-nabn.onrender.com/identify -H "Content-Type: application/json" -d "{\"email\": \"b@b.com\", \"phoneNumber\": \"1234567890\"}"
```

## Build With

This project is made using:
* Node.js
* Typescript
* Express
* SQLite

## Introduction

Consider a customer database where a user has multiple accounts. This app will to identify and keep track of a customer's identity across multiple purchases.

One customer can have multiple Contact rows in the database against them. All of the rows are linked together
with the oldest one being treated as "primary” and the rest as “secondary” .

Contact rows are linked if they have either a email or phone as common.

### Example
If a customer placed an order with
email = test@test.com & phoneNumber = 123456
and later came back to place another order with
email = newTest@newTest.edu & phoneNumber = 123456 ,
database will have the following rows:

```json
[
  {
    "id": 1,
    "phoneNumber": "123456",
    "email": "test@test.edu",
    "linkedId": null,
    "linkPrecedence": "primary",
    "createdAt": "2023-04-01T00:00:00.374Z",
    "updatedAt": "2023-04-01T00:00:00.374Z",
    "deletedAt": null
  },
  {
    "id": 23,
    "phoneNumber": "123456",
    "email": "newTest@newTest.edu",
    "linkedId": 1,
    "linkPrecedence": "secondary",
    "createdAt": "2023-04-20T05:30:00.11Z",
    "updatedAt": "2023-04-20T05:30:00.11Z",
    "deletedAt": null
  }
]
```


## Getting Started

This guide is if you want to deploy this app locally. Else you can directly use it via the endpoint exposed above.

### Prerequisites

* Node.js
* Express
* SQLite

### Installation

* First, clone the repository from GitHub
```sh
git clone https://github.com/akulgod/Identity-Reconciliation.git
```
* Open a CMD client at the project location and run the following
```sh
npm install 
```
*  Once all the necessary dependencies are installed, start the app
```sh
npm run start
```
* Congrats!!! Your app should be successfully running now.

## Usage
### Identify

**Endpoint:** /identify

**Method:**  POST

**Request Body:**
```json
[
  {
    "id": 1,
    "phoneNumber": "123456",
    "email": "test@test.edu",
    "linkedId": null,
    "linkPrecedence": "primary",
    "createdAt": "2023-04-01T00:00:00.374Z",
    "updatedAt": "2023-04-01T00:00:00.374Z",
    "deletedAt": null
  },
  {
    "id": 23,
    "phoneNumber": "123456",
    "email": "newTest@newTest.edu",
    "linkedId": 1,
    "linkPrecedence": "secondary",
    "createdAt": "2023-04-20T05:30:00.11Z",
    "updatedAt": "2023-04-20T05:30:00.11Z",
    "deletedAt": null
  }
]
```

## View data
Use any SQLite extension to view the database and respective data. I use the SQLite Viewer extension in  VSCode

## Contact

Feel free to contact me in case of any queries

* Name: Aditya Kulgod
* Email: akulgod@gmail.com
* Linkedin : <https://www.linkedin.com/in/aditya-k-30386a113/>



