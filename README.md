# shrinkpack

> Remove npm registry as a <abbr title="Single Point Of Failure">SPOF</abbr>, check-in your dependencies as tarballs.

Shrinkpack compliments the [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) command by maintaining a `node_shrinkwrap` directory which can be checked into source control. This directory contains a tarball for every dependency in your project, including nested dependencies.

## Installation

```
npm install -g shrinkpack
```

## Status

This is a new project which in it's current form is a working proof of concept.

## Feedback

Please raise an issue or via [twitter.com/fold_left](https://twitter.com/fold_left) for smaller questions and comments.

## Target Problem

On most projects I've worked on we've had a [Jenkins](http://jenkins-ci.org/) (or similiar) continuous integration environment, where we would run tests, analyse code, gather metrics, and create deployment packages.

Each time code was pushed to our `develop` and `master` branches, a repeatable process was carried out where a clean workspace is created, the latest version of the project is installed and configured, before testing and code analysis take place.

We were all very happy with this process and the convenience of npm in particular, but the phase of our builds where `npm install` listed a huge amount of network traffic would always raise the same concerns;

+ This seems slow, wasteful, and inefficient.
+ We _really_ depend on registry.npmjs.org, what do we do if it goes down?

The first suggestion was always to check in our dependencies, but the idea of some large and chatty commits whenever we chose to upgrade or change them would put us off. 

Some teams went a little further and decided that pain was acceptable and decided to proceed, only to find that some packages such as [phantomjs](https://www.npmjs.com/package/phantomjs) helpfully install the appropriate binary for you depending on what system you're running. 

This meant that if Chris added phantomjs to the project on his Mac and checked it into the repository, Helen wouldn't be able to use it on her Windows Machine. The remaining alternatives were proxies, mirrors, and caches-of-sorts. 

None of these approaches appealed to us and, grudgingly, we continued as we were (<abbr title="Your Mileage May Vary">YMMV</abbr>).

## Justification

### npm shrinkwrap

`npm shrinkwrap` is something I would recommend you use anyway, even if you don't decide to use `shrinkpack`. It brings certainty and confidence over exactly what versions of every nested dependency you've tested against and approved.

A tagged release should be a locked-down, fixed point in time which has been tested sufficiently enough that it is approved and trusted. When fed into a repeatable, automated deployment process it should always result in the same output.

Without `npm shrinkwrap` that's not guaranteed. 

Consider this snippet from the package.json of a nested dependency in your project as an example;

```json
"dependencies": {
    "lolwut": ">=0.1.0"
}
```

If `lolwut@0.2.4` contains a regression and you're not using `npm shrinkwrap` then [congratulations](http://m.memegen.com/8ky0s4.jpg), your project now contains a regression.

### shrinkpack

With you hopefully convinced of the merits of `npm shrinkwrap`, `shrinkpack` will hopefully be seen as a small and complimentary addition.

`shrinkpack` (a kind-of-but-probably-not mix of `npm shrinkwrap` and `npm pack`) takes `npm shrinkwrap` a little further by taking the .tgz tarballs of that specific, shrinkwrapped dependency graph saved by `npm shrinkwrap` and  stores them within your project.

This means;

+ No need for repeated requests to registry.npmjs.org.
+ Each package/version pair can be checked in as a single tarball, avoiding commits with all kinds of noisy diffs.
+ Packages can be checked in, while still installed by members of the team on different operating systems.
+ Compliments the typical `npm shrinkwrap` workflow.

## Workflow Example

### Standard Flow

Carina has a project called my-project with the following `package.json`.

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "main": "index.js",
  "license": "ISC",
  "dependencies": {
    "chalk": "0.5.1",
    "lodash": "3.2.0"
  }
}
```

and the following `.gitignore`.

```
npm-debug.log
node_modules
```

Having just cloned this repository, she runs `npm install --loglevel=http`.

```
npm http request GET https://registry.npmjs.org/chalk
npm http request GET https://registry.npmjs.org/lodash
npm http 304 https://registry.npmjs.org/chalk
npm http 304 https://registry.npmjs.org/lodash
npm http request GET https://registry.npmjs.org/has-ansi
npm http request GET https://registry.npmjs.org/escape-string-regexp
npm http request GET https://registry.npmjs.org/ansi-styles
npm http request GET https://registry.npmjs.org/strip-ansi
npm http request GET https://registry.npmjs.org/supports-color
npm http 304 https://registry.npmjs.org/has-ansi
npm http 304 https://registry.npmjs.org/escape-string-regexp
npm http 304 https://registry.npmjs.org/ansi-styles
npm http 304 https://registry.npmjs.org/strip-ansi
npm http 304 https://registry.npmjs.org/supports-color
npm http request GET https://registry.npmjs.org/ansi-regex
npm http 304 https://registry.npmjs.org/ansi-regex
chalk@0.5.1 node_modules/chalk
├── escape-string-regexp@1.0.2
├── ansi-styles@1.1.0
├── supports-color@0.2.0
├── has-ansi@0.1.0 (ansi-regex@0.2.1)
└── strip-ansi@0.3.0 (ansi-regex@0.2.1)

lodash@3.2.0 node_modules/lodash
```

This is typical behaviour, npm downloads the packages from the registry and installs them, leaving the following directory structure;

```
├── .gitignore
├── node_modules
│   ├── (lots of files and folders)
└── package.json
```

Next Carina runs `shrinkpack` from the my-project directory.

```
clean /Users/fold_left/Development/my-project
npm install into /Users/fold_left/Development/my-project/node_modules
npm shrinkwrap into /Users/fold_left/Development/my-project/npm-shrinkwrap.json
analysing dependency graph
saving dependencies to /Users/fold_left/Development/my-project/node_shrinkwrap
save /Users/fold_left/Development/my-project/node_shrinkwrap/chalk-0.5.1.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/ansi-styles-1.1.0.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/escape-string-regexp-1.0.2.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/has-ansi-0.1.0.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/ansi-regex-0.2.1.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/strip-ansi-0.3.0.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/ansi-regex-0.2.1.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/supports-color-0.2.0.tgz
save /Users/fold_left/Development/my-project/node_shrinkwrap/lodash-3.2.0.tgz
update /Users/fold_left/Development/my-project/npm-shrinkwrap.json
done
```

Leaving the following directory structure.

```
├── .gitignore
├── node_modules
│   ├── (lots of files and folders)
├── node_shrinkwrap
│   ├── ansi-regex-0.2.1.tgz
│   ├── ansi-styles-1.1.0.tgz
│   ├── chalk-0.5.1.tgz
│   ├── escape-string-regexp-1.0.2.tgz
│   ├── has-ansi-0.1.0.tgz
│   ├── lodash-3.2.0.tgz
│   ├── strip-ansi-0.3.0.tgz
│   └── supports-color-0.2.0.tgz
├── npm-shrinkwrap.json
└── package.json
```

An up to date `npm-shrinkwrap.json` has also been created, which references via the `resolved` property, the checked-in packages in the `node_shrinkwrap` directory.

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "chalk": {
      "version": "0.5.1",
      "from": "chalk@>=0.5.1 <0.6.0",
      "resolved": "node_shrinkwrap/chalk-0.5.1.tgz",
      "dependencies": {
        "ansi-styles": {
          "version": "1.1.0",
          "from": "ansi-styles@>=1.1.0 <2.0.0",
          "resolved": "node_shrinkwrap/ansi-styles-1.1.0.tgz"
        },
        "escape-string-regexp": {
          "version": "1.0.2",
          "from": "escape-string-regexp@>=1.0.0 <2.0.0",
          "resolved": "node_shrinkwrap/escape-string-regexp-1.0.2.tgz"
        },
        "has-ansi": {
          "version": "0.1.0",
          "from": "has-ansi@>=0.1.0 <0.2.0",
          "resolved": "node_shrinkwrap/has-ansi-0.1.0.tgz",
          "dependencies": {
            "ansi-regex": {
              "version": "0.2.1",
              "from": "ansi-regex@>=0.2.0 <0.3.0",
              "resolved": "node_shrinkwrap/ansi-regex-0.2.1.tgz"
            }
          }
        },
        "strip-ansi": {
          "version": "0.3.0",
          "from": "strip-ansi@>=0.3.0 <0.4.0",
          "resolved": "node_shrinkwrap/strip-ansi-0.3.0.tgz",
          "dependencies": {
            "ansi-regex": {
              "version": "0.2.1",
              "from": "ansi-regex@>=0.2.0 <0.3.0",
              "resolved": "node_shrinkwrap/ansi-regex-0.2.1.tgz"
            }
          }
        },
        "supports-color": {
          "version": "0.2.0",
          "from": "supports-color@>=0.2.0 <0.3.0",
          "resolved": "node_shrinkwrap/supports-color-0.2.0.tgz"
        }
      }
    },
    "lodash": {
      "version": "3.2.0",
      "from": "lodash@>=3.2.0 <4.0.0",
      "resolved": "node_shrinkwrap/lodash-3.2.0.tgz"
    }
  }
}
```

Carina checks this code into Git and tells her co-worker Clive that it's ready for him to contribute to.

Having just cloned this repository, he runs `npm install --loglevel=http`.

```
chalk@0.5.1 node_modules/chalk
├── escape-string-regexp@1.0.2
├── ansi-styles@1.1.0
├── supports-color@0.2.0
├── strip-ansi@0.3.0 (ansi-regex@0.2.1)
└── has-ansi@0.1.0 (ansi-regex@0.2.1)

lodash@3.2.0 node_modules/lodash
```

This is new behaviour, npm didn't hit the network at all. Instead it read the packages from the `node_shrinkwrap` directory directly and installed them straight away.

```
├── .gitignore
├── node_modules
│   ├── (lots of files and folders)
├── node_shrinkwrap
│   ├── ansi-regex-0.2.1.tgz
│   ├── ansi-styles-1.1.0.tgz
│   ├── chalk-0.5.1.tgz
│   ├── escape-string-regexp-1.0.2.tgz
│   ├── has-ansi-0.1.0.tgz
│   ├── lodash-3.2.0.tgz
│   ├── strip-ansi-0.3.0.tgz
│   └── supports-color-0.2.0.tgz
├── npm-shrinkwrap.json
└── package.json
```

### Changing and removing dependencies

Simply edit your package.json and re-run `shrinkwrap` to update your `npm-shrinkwrap.json` file and `node_shrinkwrap` directory.
