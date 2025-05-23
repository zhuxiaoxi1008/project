


  // 定义全局变量
import onePage from './onePage'
import multiPages from './multiPages'

export default function(type, planType, hasCode, codeRequirement) {
    // let type = type === '1' ? '整页形式' : '分页形式'
    let planTypeText = planType === '1' ? '概述性的讲解' : '精细化的讲解' 
    let hasCodeText = hasCode === '1' ? '必须包含' : '必要时包含'

    let codeRequirementText = hasCode === '1' ? `- ${codeRequirement}`: '- 必要时包含关键知识点的动画或交互仿真展示'

    let text = ''
    if (type === '1') {
      text = onePage(planTypeText, hasCodeText, codeRequirementText)
    } else if (type === '2') {
      text = multiPages(planTypeText, hasCodeText, codeRequirementText)
    }

    return text;
  }
