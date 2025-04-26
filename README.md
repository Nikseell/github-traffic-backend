# GitHub Traffic Backend

A NestJS-based backend service for tracking, storing, and analyzing GitHub repository traffic data using MongoDB and the GitHub API via Octokit.

## Description

This application provides a REST API designed to:

- Fetch repository traffic data (views, clones) from GitHub using the Octokit library.
- Store this data persistently in a MongoDB database via Mongoose.
- Expose endpoints for retrieving and potentially processing this data.

This backend serves as the data source for the [GitHub Traffic Frontend](https://github.com/Nikseell/github-traffic-frontend), which visualizes the repository traffic data in charts.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

The API documentation (using Swagger) is available once the application is running:

```
http://localhost:3000/api
```

## Stay in touch

- Author - [Your Name]

## License

This project is [MIT licensed](LICENSE).
