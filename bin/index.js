#!/usr/bin/env node
const $inquirer = require('inquirer'); // 对话交互
const $program = require('commander');
const $handlebars = require('handlebars');
const $download = require('download-git-repo');
const $colors = require('colors'); // 改变输出颜色
const $shell = require('shelljs');  // shell脚本
const $fs = require('fs');
const $path = require('path');
const ora = require('ora');
const $logo = require('../src/logo');
const $package = require($path.resolve(__dirname, '../package.json'))

const adminTpl = "https://github.com:2020807070/vue-admin#template"
const vuepressTpl = "https://github.com:2020807070/cchao-blog#template"


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
    $inquirer.prompt(
      [{
        type: 'list',
        name: 'type',
        message: '请选择你要创建的项目:',
        choices: [
          '后台管理系统',
          'Vuepress博客'
        ]
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
      if (!answers.moveon) {
        $shell.echo(`您终止了${answers.type} --> ${answers.name} 的创建!`.red)
        process.exit(1)
      }
      if (answers.type === '后台管理系统') {
        $download(adminTpl, answers.name, { clone: true }, (err) => {

        })
      }
      if (answers.type === 'Vuepress博客') {
        var spinner = ora('模板初始化 请稍后...');
        spinner.start();
        $download(vuepressTpl, answers.name, { clone: true }, (err) => {
          const fileName = `${answers.name}/docs/.vuepress/config.js`;
          const content = $fs.readFileSync(fileName).toString();
          const result = $handlebars.compile(content)({
            title: answers.title,
            description: answers.description
          });
          $fs.writeFileSync(fileName, result);
          if (err) {
            spinner.fail('下载失败'.red);
          } else {
            spinner.succeed(`${answers.name} - 创建成功！`.green);
          }
        })
      }
    })
  });

$program.parse(process.argv);

function exit() {
  $shell.echo($logo)
  $program.outputHelp() // 输出说明
  process.exit(1) // 退出
}

if (process.argv.length < 3) {
  exit()
}