const fs = require('fs')
const baseFilePath = '/mnt/d/Users/80279309/Documents/fun/github/funye.github.io/docs'

function getChildren(path) {
  const result = []
  readDirSync(baseFilePath+path, result, path)
  return result
}

function readDirSync(path, result, prefix){
  var pa = fs.readdirSync(path);
  pa.forEach(function(ele,index){
    var info = fs.statSync(path+ele)
    if(info.isDirectory()) {
      readDirSync(path+ele,result,prefix)
    } else {
      if (ele.includes(".md")) {
        result.push(prefix + ele.slice(0, ele.lastIndexOf(".")))
      }
    }
  })
}


module.exports = {
  getChildren:getChildren,
  title: "Fun Notes",
  theme: 'reco',
  themeConfig: {
  	logo: '/images/logo.png',
  	type: 'blog',
  	lastUpdated: 'Last Updated',
  	authorAvatar: '/images/avatar.png',
    nav: [
      { text: '主页', link: '/', icon: 'reco-home' },
      /*{
        text: '分类',
        icon: 'reco-category',
        ariaLabel: '分类',
        items: [
          { text: 'Java基础', link: '/categories/Java基础/' },
          { text: '数据库', link: '/categories/数据库/' },
          { text: '算法设计', link: '/categories/算法设计/' },
          { text: '基础组件', link: '/categories/基础框架/' },
          { text: '架构&分布式', link: '/categories/架构&分布式/' },
          { text: '大数据', link: '/categories/大数据/' },
          { text: '工具&部署', link: '/categories/工具&部署/' },
          // { text: '团队建设', link: '/categories/团队建设/' },
        ]
      },
      { text: '标签', link: '/tag/', icon: 'reco-tag' },*/
  	  { text: '基础知识', link: '/00-java/', icon: '' },
  	  { text: '数据库', link: '/01-database/', icon: '' },
  	  { text: '算法设计', link: '/02-algorithm/', icon: '' },
  	  { text: '基础组件', link: '/03-framework/', icon: '' },
  	  { text: '架构&分布式', link: '/04-architecture/', icon: '' },
  	  { text: '大数据', link: '/05-bigdata/', icon: '' },
  	  { text: '工具&部署', link: '/06-tool/', icon: '' },
  	  // { text: '团队建设', link: '/07-team/', icon: '' },
      { text: '关于', link: '/08-about/', icon: 'reco-account' },
      { text: 'Github', link: 'https://github.com/funye/funye.github.io' , icon: 'reco-github'}
    ],

    subSidebar: 'auto',
    sidebar: {
      '/00-java/':[
        { title: 'Java基础', collapsable: false, children: getChildren('/00-java/base/') },
        { title: 'Java并发', collapsable: false, children: getChildren('/00-java/concurrency/') },
        { title: 'jvm调优', collapsable: false, children: getChildren('/00-java/jvm/') },
        { title: '网络编程', collapsable: false, children: getChildren('/00-java/network/') }
      ],
      '/01-database/':[
        { title: 'MySQL', collapsable: false, children: getChildren('/01-database/mysql/') },
        { title: 'MongoDB', collapsable: false, children: getChildren('/01-database/mongodb/') },
        { title: 'ElasticSearch', collapsable: false, children: getChildren('/01-database/es/') },
      ],
      '/02-algorithm/':[
        { title: '数据结构', collapsable: false, children: getChildren('/02-algorithm/data-structure/') },
        { title: '查找算法', collapsable: false, children: getChildren('/02-algorithm/search/') },
        { title: '排序算法', collapsable: false, children: getChildren('/02-algorithm/sort/') },
        { title: '算法思想', collapsable: false, children: getChildren('/02-algorithm/thinking/') },
        { title: '设计模式', collapsable: false, children: getChildren('/02-algorithm/design-pattern/') },
      ],
      '/03-framework/':[
        { title: 'Spring', collapsable: false, children: getChildren('/03-framework/spring/') },
        { title: 'SpringBoot', collapsable: false, children: getChildren('/03-framework/springboot/') },
        { title: 'Mybatis', collapsable: false, children: getChildren('/03-framework/mybatis/') },
        { title: 'Tomcat', collapsable: false, children: getChildren('/03-framework/tomcat/') },
        { title: 'Nginx', collapsable: false, children: getChildren('/03-framework/nginx/') },
      ],
      '/04-architecture/':[
        { title: '架构理论', collapsable: false, children: getChildren('/04-architecture/theory/') },
        { title: '分布式方案', collapsable: false, children: getChildren('/04-architecture/ds/') },
        { title: '分布式组件', collapsable: false, children: getChildren('/04-architecture/ds-framework/') },
        { title: '架构示例', collapsable: false, children: getChildren('/04-architecture/case/') },
      ],
      '/05-bigdata/':[
        { title: 'Hive', path:''},
        { title: 'Spark', path:''},
      ],
      '/06-tool/':[
        { title: '常用工具', collapsable: false, children: getChildren('/06-tool/tool/') },
        { title: 'Linux', collapsable: false, children: getChildren('/06-tool/linux/') },
        { title: 'Docker', collapsable: false, children: getChildren('/06-tool/docker/') },
      ],
//      '/07-team/':[
//        { title: '技术规范', path:''},
//        { title: '文档规范', path:''},
//        { title: '工作流程', path:''},
//        { title: '绩效考核', path:''},
//      ],
    }
  },
  plugins: {
  }
}