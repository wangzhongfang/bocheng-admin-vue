import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 项目成员信息 */
export interface Staff {
          id: number; // 部门id
          userId: number; // 人员id
          userName: string; // 人员名称
          prjId: number; // 项目id
  }

// 项目成员 API
export const StaffApi = {
  // 查询项目成员分页
  getStaffPage: async (params: any) => {
    return await request.get({ url: `/prj/staff/page`, params })
  },

  // 查询项目成员详情
  getStaff: async (id: number) => {
    return await request.get({ url: `/prj/staff/get?id=` + id })
  },

  // 新增项目成员
  createStaff: async (data: Staff) => {
    return await request.post({ url: `/prj/staff/create`, data })
  },

  // 修改项目成员
  updateStaff: async (data: Staff) => {
    return await request.put({ url: `/prj/staff/update`, data })
  },

  // 删除项目成员
  deleteStaff: async (id: number) => {
    return await request.delete({ url: `/prj/staff/delete?id=` + id })
  },

  /** 批量删除项目成员 */
  deleteStaffList: async (ids: number[]) => {
    return await request.delete({ url: `/prj/staff/delete-list?ids=${ids.join(',')}` })
  },

  // 导出项目成员 Excel
  exportStaff: async (params) => {
    return await request.download({ url: `/prj/staff/export-excel`, params })
  },
}