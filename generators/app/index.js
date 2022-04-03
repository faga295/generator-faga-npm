'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const _ = require('lodash')

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to use ${chalk.red('generator-faga-npm')} generator!`
      )
    );

    const prompts = [

      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description',
        default: ''
      },
      {
        type: 'confirm',
        name: 'isTypescript',
        message: 'Would you like to type your code with typescript?',
        default: true
      },
      {
        type: 'confirm',
        name: 'isRollup',
        message: 'Would you like to bundle your code with rollup?',
        default: true
      },
      {
        type: 'confirm',
        name: 'isJest',
        message: 'Would you like to test your code with jest?',
        default: true
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.initPack()
    this.renderTplFile()
  }
  initPack(){
    let pkg = this.fs.readJSON(this.templatePath('package.json'),{})
    pkg = _.merge(pkg,{
      name:this.props.name,
      description:this.props.description
    })
    if(this.props.isTypescript){
      pkg = _.merge(pkg,{
        scripts:{
          build:'tsc'
        },
        devDependencies:{
          "typescript":"^4.6.3",
          "ts-node": "^10.7.0",
        }
      })
    }
    if(this.props.isRollup){
      pkg = _.merge(pkg,{
        scripts:{
          build:this.props.isTypescript?'tsc & rollup --config rollup.config.js':'rollup --config rollup.config.js'
        },
        devDependencies:{
          "rollup": "^2.70.1"
        }
      })
    }
    if(this.props.isJest){
      pkg = _.merge(pkg,{
        scripts:{
          "test": "jest --config jestconfig.json",
        },
        devDependencies:{
          "jest": "^27.5.1",
        }
      })
      if(this.props.isTypescript){
        pkg = _.merge(pkg,{
          devDependencies:{
            "@types/jest": "^27.4.1"
          }
        })
      }
    }
    this.log(pkg)
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }
  renderTplFile(){
    let target = [
      ['.gitignore','.gitignore'],
      'README.md',
    ]
    if(this.props.isTypescript){
      target = [...target,'tsconfig.json']
      target = [...target,'src/index.ts']
    }else{
      target = [...target,'src/index.js']
    }
    if(this.props.isJest){
      target = [...target,'jestconfig.json']
    }
    if(this.props.isRollup){
      target = [...target,'rollup.config.js']
    }
    target.forEach(item=>{
      let fromPath = ''
      let toPath = ''
      if(typeof item === 'string'){
        fromPath = item;
        toPath = item
      }else{
        fromPath = item[0],
        toPath = item[1]
      }
      this.fs.copyTpl(this.templatePath(fromPath),this.destinationPath(toPath),this.props)
    })
  }
};
