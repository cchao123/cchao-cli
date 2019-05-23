#!/usr/bin/env node
const $inquirer = require('inquirer'); // 对话交互
const $program = require('commander');
const $handlebars = require('handlebars');
const $download = require('download-git-repo');
const $colors = require('colors'); // 改变输出颜色
const $shell = require('shelljs');  // shell脚本
const $fs = require('fs');
const $path = require('path');
const $ora = require('ora');
const $logo = require('../src/logo');
const $package = require($path.resolve(__dirname, '../package.json'))

const config = {
  // 'Vue多页项目': {
  //   tplName: 'Vue多页项目',
  //   tplUrl: 'tplUrl'
  // },
  '后台管理系统': {
    tplName: '后台管理系统',
    tplUrl: 'https://github.com:2020807070/vue-admin#template'
  },
  'Vuepress博客': {
    tplName: 'Vuepress博客',
    tplUrl: 'https://github.com:2020807070/cchao-blog#template'
  }
}


$program
  .version($package.version, '-v, --version')
  .on('--help', function () {
    console.log('')
    console.log('Examples:')
    console.log('  $ cchao-cli init')
  })

$program.version($package.version, '-v, --version')
  .command('init')
  .description('创建初始化项目')
  .action(() => {
    let choices = []
    for (var key in config) { choices.push(key) }
    $inquirer.prompt(
      [{
        type: 'list',
        name: 'type',
        message: '请选择你要创建的项目:',
        choices: choices
      },
      {
        message: '请输入项目名称:',
        name: 'name',
        validate: function (cm) {
          if (!cm && cm.trim() === '') return '项目名称不能为空'
          return true
        }
      },
      {
        message: '请输入项目标题:',
        name: 'title',
        validate: function (cm) {
          if (!cm && cm.trim() === '') return '项目标题不能为空'
          return true
        }
      },
      {
        message: '请输入项描述:',
        name: 'description',
        validate: function (cm) {
          if (!cm && cm.trim() === '') return '项目描述不能为空'
          return true
        }
      },
      {
        type: 'confirm',
        name: 'moveon',
        message: '是否继续?'
      }]
    ).then(answers => {
      // 终止退出
      if (!answers.moveon) {
        $shell.echo(`您终止了${answers.type} --> ${answers.name} 的创建!`.red)
        process.exit(1)
      }
      // loading
      const spinner = $ora(`${answers.type}初始化 请稍后...`);
      spinner.start();

      switch (answers.type) {
        case '后台管理系统':
          downloadTpl(answers).then((err) => {
            const AppVue = `${answers.name}/src/App.vue`;
            const pageageJson = `${answers.name}/package.json`;
            $fs.writeFileSync(AppVue, $handlebars.compile($fs.readFileSync(AppVue).toString())({
              title: answers.title
            }));
            $fs.writeFileSync(pageageJson, $handlebars.compile($fs.readFileSync(pageageJson).toString())({
              name: answers.name,
              description: answers.description
            }));
            checkError(err, answers, spinner)
          })
          break;
        case 'Vuepress博客':
          downloadTpl(answers).then((err) => {
            const fileName = `${answers.name}/docs/.vuepress/config.js`;
            $fs.writeFileSync(fileName, $handlebars.compile($fs.readFileSync(fileName).toString())({
              title: answers.title,
              description: answers.description
            }));
            checkError(err, answers, spinner)
          })
          break;
        default:
          break;
      }
    })
  });


// 公用模板下载
function downloadTpl(answers) {
  return new Promise((resolve, reject) => {
    $download(config[answers.type].tplUrl, answers.name, { clone: true }, (err) => {
      resolve(err)
    })
  })
}

// 公用状态检测
function checkError(err, answers, spinner) {
  err ? spinner.fail('下载失败'.red) : spinner.succeed(`${answers.name} - 创建成功！`.green);
}

$program.parse(process.argv);

function exit() {
  $shell.echo($logo)
  $program.outputHelp() // 输出说明
  process.exit(1) // 退出
}

if (process.argv.length < 3) {
  exit()
}