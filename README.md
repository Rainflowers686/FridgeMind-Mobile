# FridgeMind Mobile

English | [简体中文](README.zh-CN.md)

This repository contains the Expo and React Native mobile client for the FridgeMind student project.

The app is the phone-side interface. Service behavior and hardware integration depend on the separately configured project components; this repository alone does not establish an end-to-end deployment or recognition result.

## Start the app

~~~sh
npm ci
npx expo start
~~~

The local API endpoint is configured in the app. Keep machine-specific addresses and credentials out of public documentation and commits.

## Project files

- App.js — application entry
- assets/ — app assets
- config.js — local API configuration
- package.json and package-lock.json — JavaScript dependencies
