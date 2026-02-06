import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 项目-预算类型信息 */
export interface BudgetType {
          id: number; // 主键id
          budgetName: string; // 预算名称
          budgetLevel: number; // 预算等级
          budgetCode: string; // 预算编码
          status: number; // 状态 0.已封存 1.未封存
          remark: string; // 备注
  }

// 项目-预算类型 API
export const BudgetTypeApi = {
  // 查询项目-预算类型分页
  getBudgetTypePage: async (params: any) => {
    return await request.get({ url: `/prj/budget-type/page`, params })
  },

  // 查询项目-预算类型详情
  getBudgetType: async (id: number) => {
    return await request.get({ url: `/prj/budget-type/get?id=` + id })
  },

  // 新增项目-预算类型
  createBudgetType: async (data: BudgetType) => {
    return await request.post({ url: `/prj/budget-type/create`, data })
  },

  // 修改项目-预算类型
  updateBudgetType: async (data: BudgetType) => {
    return await request.put({ url: `/prj/budget-type/update`, data })
  },

  // 删除项目-预算类型
  deleteBudgetType: async (id: number) => {
    return await request.delete({ url: `/prj/budget-type/delete?id=` + id })
  },

  /** 批量删除项目-预算类型 */
  deleteBudgetTypeList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/budget-type/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目-预算类型 Excel
  exportBudgetType: async (params) => {
    return await request.download({ url: `/prj/budget-type/export-excel`, params })
  },
}