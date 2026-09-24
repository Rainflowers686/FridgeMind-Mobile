# FridgeMind Mobile

*The Expo and React Native phone client for the FridgeMind student project.*


[English](README.md) | [简体中文](README.zh-CN.md)

**Guide:** [Status](#project-status) · [Start the app](#start-the-app) · [Project files](#project-files)


This repository contains the Expo and React Native mobile client for the FridgeMind student project.

The app is the phone-side interface. Service behavior and hardware integration depend on the separately configured project components; this repository alone does not establish an end-to-end deployment or recognition result.

## Project status

Student project mobile client. Service and hardware behavior depend on the separately configured project components.

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
