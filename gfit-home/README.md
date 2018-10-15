## Gfit前端项目
---
<table>
<tr>
    <td > 分支 </td>
    <td > 项目 </td>
    <td> 说明 </td>
</tr>
<tr style='background:#eee;'>
    <td rowspan="4"> question <br/>
    <td rowspan="4"> [h5]marathon-兰马 <br/>[h5]question-电子说明书<br/>[h5]question/helpFeedback-帮助与反馈<br/>[h5]runTogether-一起跑</td>
    <td rowspan="4">html项目</td>
</tr>
<tr></tr>
<tr></tr><tr></tr><tr></tr><tr></tr>
<tr>
    <td > wx-gfit <br/>
    <td> [小程序]wx-gfit </td>
    <td>gfit小程序:一起跑/知识库/小目标 </td>
</tr>
<tr>
    <td > wx-blueToothTest <br/>
    <td> [小程序]wx-blueTooth-蓝牙测试 </td>
    <td>蓝牙测试小程序</td>
</tr>
<tr>
    <td > develop <br/>
    <td colspan="2"> 测试分支 </td>
</tr>
<tr>
    <td > master <br/>
    <td colspan="2"> 线上分支 </td>
</tr>
</table>






&ensp;
---
&ensp;

## Gfit前端项目部署环境

| 环境 | 服务器 | 文件目录 | URL | 说明 |
|:--|:--|:--|:--|:--|
| 测试 | 47.98.251.177 | /home/www/dev/gfit-home/ | https://dev.gfitgo.com/gfit-home/ | 每次push到develop分支都会触发CI/CD自动部署到该环境 |
| 线上 | 47.98.251.177 | /home/www/gfit-home/ | https://g.gfitgo.com/ | 目前无CI/CD |

&ensp;
---
&ensp;

```已适配gitlab-ci,请查看CI/CD```