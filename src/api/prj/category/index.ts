import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 项目分类信息 */
export interface Category {
  id: number // id
  categoryName: string // 项目类别名称
  status: number // 状态 0.已封存 1.未封存
}

// 项目分类 API
export const CategoryApi = {
  // 查询项目分类分页
  getCategoryPage: async (params: any) => {
    return await request.get({ url: `/prj/category/page`, params })
  },

  // 查询项目分类详情
  getCategory: async (id: number) => {
    return await request.get({ url: `/prj/category/get?id=` + id })
  },

  // 新增项目分类
  createCategory: async (data: Category) => {
    return await request.post({ url: `/prj/category/create`, data })
  },

  // 修改项目分类
  updateCategory: async (data: Category) => {
    return await request.put({ url: `/prj/category/update`, data })
  },

  // 删除项目分类
  deleteCategory: async (id: number) => {
    return await request.delete({ url: `/prj/category/delete?id=` + id })
  },

  /** 批量删除项目分类 */
  deleteCategoryList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/category/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目分类 Excel
  exportCategory: async (params) => {
    return await request.download({ url: `/prj/category/export-excel`, params })
  },

  // 查询项目分类列表
  getCategoryList: async (params: any) => {
    return await request.get({ url: `/prj/category/list`, params })
  },

  // 修改项目分类状态
  changeStatus: async (data: Category) => {
    return await request.put({ url: `/prj/category/update-status`, data })
  },

  // 查询项目分类材料数量
  getCategoryListWithMaterialCount: async (params: any) => {
    return await request.get({ url: `/prj/category/list-with-material-count`, params })
  }
}
