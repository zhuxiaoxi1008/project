import request from '@/utils/request'

// 获取计划列表
export function getPlanList() {
  return request({
    url: '/material/created',
    method: 'get',
  })
}

// 一键生成
export function generatePlan(data: any) {
  return request({
    url: '/material/generate',
    method: 'post',
    data
  })
}

export function removePlan(id: number|string) {
  return request({
    url: `/material/del/${id}`,
    method: 'delete',
  })
}

export function updatePlan(data: any) {
  return request({
    url: '/material/update',
    method: 'post',
    data
  })
}

