<template>
  <div class="home">
    <!-- 页头功能选项 -->
    <div class="header-options">
      <div class="header-item">
        <button @click="goToContacts">通讯录</button>
      </div>
      <div class="header-item">
        <button @click="goToProfile">个人信息</button>
      </div>
      <div class="header-item">
        <button @click="enterAdminMode">管理员模式</button>
      </div>
    </div>

    <!-- 页面内容过渡动画 -->
    <transition name="fade">
      <div>
        <!-- 使用 v-show 控制当前显示的视图 -->
        <div v-show="currentView === 'contacts'" class="view contacts-view">
          <!-- 通讯录视图 -->
          <div v-for="(dept, index) in departments" :key="index" class="department">
            <div class="dept-header" @click="toggle(dept.name)">
              {{ dept.name }} (共 {{ dept.employees.length }} 人)
              <span>{{ dept.isOpen ? '▼' : '▶' }}</span>
            </div>
            <transition name="slide">
              <div v-show="dept.isOpen" class="employee-list">
                <ul>
                  <li v-for="emp in dept.employees" :key="emp.id">
                    <div class="employee-info">
                      <div class="name">{{ emp.name }}</div>
                      <div class="position">{{ emp.position }}</div>
                    </div>
                    <button @click="viewEmployee(emp)">查看</button>

                  </li>
                </ul>
              </div>
            </transition>
          </div>
          <!-- 员工信息弹窗 -->
<div v-if="selectedEmployee" class="employee-detail-modal">
  <div class="modal-content">
    <h3>员工详情</h3>
    
    <div class="employee-detail-row">
      <span class="detail-label">姓名：</span>
      <span class="detail-value">{{ selectedEmployee.name }}</span>
    </div>
    
    <div class="employee-detail-row">
      <span class="detail-label">工号：</span>
      <span class="detail-value">{{ selectedEmployee.emp_id }}</span>
    </div>
    
    <div class="employee-detail-row">
      <span class="detail-label">部门：</span>
      <span class="detail-value">{{ selectedEmployee.department }}</span>
    </div>
    
    <div class="employee-detail-row">
      <span class="detail-label">职位：</span>
      <span class="detail-value">{{ selectedEmployee.position }}</span>
    </div>
    
    <div class="employee-detail-row">
      <span class="detail-label">邮箱：</span>
      <span class="detail-value">{{ selectedEmployee.email || '未填写' }}</span>
    </div>
    
    <div class="employee-detail-row">
      <span class="detail-label">电话：</span>
      <span class="detail-value">{{ selectedEmployee.phone || '未填写' }}</span>
    </div>
    
    <div class="modal-actions">
      <button @click="closeEmployeeDetail" class="close-btn">关闭</button>
    </div>
  </div>
</div>
        </div>

        <div v-show="currentView === 'profile'" class="view profile-view profile-fullscreen profile-no-card">
          <!-- 个人信息视图 -->
          <div class="profile-info-group">
            <div class="info-row">
              <span class="label">工号：</span>
              <span class="value">{{ currentUser?.emp_id }}</span>
            </div>
            <div class="info-row">
              <span class="label">姓名：</span>
              <span class="value">{{ currentUser?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">部门：</span>
              <span class="value">{{ currentUser?.department }}</span>
            </div>
            <div class="info-row">
              <span class="label">职位：</span>
              <span class="value">{{ currentUser?.position }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮箱：</span>
              <span class="value">{{ currentUser?.email || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话：</span>
              <span class="value">{{ currentUser?.phone || '未填写' }}</span>
            </div>
          </div>
<!-- 编辑按钮 -->
<div class="profile-actions">
  <button @click="openEditModal" class="edit-profile-btn">编辑资料</button>
</div>
</div>

<!-- 个人信息修改弹窗 -->
<div v-if="showEditModal" class="modal">
  <div class="modal-content">
    <h3>编辑个人信息</h3>
    <div class="edit-field">
      <label>电话：</label>
      <input v-model="currentUser.phone" type="text" placeholder="请输入电话号码">
    </div>
    <div class="edit-field">
      <label>邮箱：</label>
      <input v-model="currentUser.email" type="text" placeholder="请输入邮箱地址">
    </div>
    <div class="modal-actions">
      <button @click="updateUserInfo" class="save-btn">保存</button>
      <button @click="closeEditModal" class="cancel-btn">取消</button>
    </div>
  </div>
         
        </div>

        <div v-show="currentView === 'admin'" class="view admin-view admin-card">
          <!-- 管理员视图 -->
          <h3>管理员模式</h3>
          <p>当前为管理员视角，可管理用户和权限。</p>
          <!-- 后续可拓展管理员功能 -->
        </div>
      </div>
    </transition>

  </div>
</template>

<script>

import axios from 'axios';
import { ElMessage } from 'element-plus';
export default {
  name: 'HomeView',
  data() {
    return {
      emp_id: '',
      departments: [],
      currentUser: null, // 用于保存当前登录用户的信息
      allEmployees: [] ,// 存储所有员工数据
       currentView: 'contacts' ,// 默认显示通讯录
       showEditModal: false ,// 控制模态框显示
       selectedEmployee: null // 新增：用于存储选中的员工信息
    };
  },
  mounted() {
    this.emp_id = localStorage.getItem('emp_id') || '游客';
    this.fetchEmployees().then(() => {
    this.getCurrentUser();
  });
  },
  methods: {
 
    async fetchEmployees() {
      const token = sessionStorage.getItem('token');
      try {
    
      const response = await axios.post('http://localhost:8082/employees', {}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
    console.log('Response Data:', response.data); // 打印响应内容
    console.log('Data Type:', typeof response.data); // 查看类型

    let employees;

    if (Array.isArray(response.data)) {
      // 如果是数组，直接使用
      employees = response.data;
    } else if (typeof response.data === 'string') {
      // 如果是字符串，尝试解析 JSON
      employees = JSON.parse(response.data);
    } else if (response.data.code === 1) {
      // 如果有 code 字段且值为 1，表示成功，取 data 字段
      employees = response.data.data;
    } else {
      console.error('未知数据格式:', response.data);
      return;
    }

    const processedData = employees.map(emp => ({
      emp_id: emp.emp_id,
      name: emp.name,
      department: emp.department_id|| '未知部门',
      position: emp.position|| '未知职位',
      email: emp.email || '未填写',  
  phone: emp.phone || '未填写'    

    }));

    this.allEmployees = processedData;
    this.groupByDepartment(processedData);
  } catch (error) {
    console.error('请求员工数据失败:', error);
  }
    },

    groupByDepartment(employees) {
      const map = {};
      employees.forEach(emp => {
        if (!map[emp.department]) {
          map[emp.department] = [];
        }
        map[emp.department].push(emp);
      });

      this.departments = Object.keys(map).map(deptName => ({
        name: deptName,
        employees: map[deptName],
        isOpen: false
      }));
    },

    toggle(deptName) {
      const dept = this.departments.find(d => d.name === deptName);
      if (dept) {
        dept.isOpen = !dept.isOpen;
      }
    },
     getCurrentUser() {
    // 从 allEmployees 中找到当前用户
    const user = this.allEmployees.find(emp => emp.emp_id === this.emp_id);

    if (user) {
      this.currentUser = user;
    } else {
      console.warn('未找到当前用户信息');
      this.currentUser = null;
    }
  },
    goToContacts() {
    // 跳转到通讯录页面
    this.currentView = 'contacts';
  },
  goToProfile() {
    // 跳转到个人信息页面
    this.currentView = 'profile';
  },
  enterAdminMode() {
    // 进入管理员模式
    this.currentView = 'admin';
  },
  viewEmployee(employee) {
    // 查看员工详情
    console.log("查看员工:", employee);
    this.selectedEmployee = employee;
  },
  closeEmployeeDetail() {
  this.selectedEmployee = null;
},

  
  openEditModal() {
    console.log("打开编辑模态框");
    this.showEditModal = true;
  },
  
  closeEditModal() {
    this.showEditModal = false;
  },
  
  async updateUserInfo() {
    const token = sessionStorage.getItem('token');
    try {
       
      // 调用后端更新接口
      const response = await axios.post('http://localhost:8082/update', {
        emp_id: this.currentUser.emp_id,
        phone: this.currentUser.phone,
        email: this.currentUser.email
      },
     {
  headers: {
    Authorization: `Bearer ${token}`}},);
      
      if (response.data.code === 1) {
        // 更新成功
         ElMessage.success('更新成功');
        this.closeEditModal();
        
        // 可选：重新获取用户信息以确保数据最新
        this.getCurrentUser();
      } else {
        ElMessage.success('更新失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      ElMessage.success('更新信息失败');
    }
  }
}


  
};
</script>

<style scoped>
.header-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  background-color: #757575; /* 保持原有背景色 */
  padding: 0.5rem 0.5rem; /* 减少横向留白 */
  border-radius: 6px;
  overflow: hidden; /* 确保子元素圆角不溢出 */
}

.header-options button {
  background-color: #1976D2; /* 灰色按钮 */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.header-options button:hover {
  background-color: #fff; /* 深灰色悬停效果 */
}

.employee-list button {
  background-color: #2196F3; /* 灰色按钮 */
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.employee-list button:hover {
  background-color: #ccc; /* 深灰色悬停效果 */
}

.home {
  padding: 2rem;
  background-color: #f5f5f5; /* 灰色背景 */
}

.department {
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dept-header {
  background-color: #e0e0e0; /* 浅灰色背景 */
  padding: 1rem;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-list ul {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0;
}

.employee-list li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-list li:last-child {
  border-bottom: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease-out;
  max-height: 200px;
}
.slide-enter,
.slide-leave-to {
  max-height: 0;
  overflow: hidden;
}

.header-item {
  flex: 1;
  margin: 0 0.25rem; /* 按钮之间留点空隙 */
}

.header-item button {
  width: 100%;
  height: 100%;
  background-color: #757575;
  color: white;
  border: none;
  padding: 1rem 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease; /* 新增：所有属性平滑过渡 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 新增：轻柔阴影 */
}

.header-item button:hover {
  background-color: #474646;
}

.employee-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.employee-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-weight: bold;
}

.position {
  color: #666;
  font-size: 0.9em;
}

.profile-card,
.admin-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.profile-card h3,
.admin-card h3 {
  margin-top: 0;
  color: #333;
}

.label-style {
  width: 100px;
  font-weight: bold;
  background-color: #f5f7fa;
}

.profile-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
}

/* 个人信息展示*/
.profile-fullscreen {
  width: 100%;
  min-height: 50vh;
  background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  background-image: url('https://images.unsplash.com/photo-1500964755822-32f2bec2a0bd');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}


.profile-no-card {
  padding: 0.5rem;
  text-align: center;
}

.profile-info-group {
  max-width: 800px;
  margin: 0.5rem auto 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 每行两个 */
  gap: 2rem;
  text-align: left;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9; /* 可选：增加背景色提升可读性 */
  border-radius: 8px; /* 可选：圆角美化 */
}

.label {
  font-weight: bold;
  color: #333;
  min-width: 100px;
  font-size: 2rem; /* 字号调大 */
}

.value {
  color: #555;
  flex: 1;
  padding-left: 1rem;
  font-size: 1.4rem; /* 字号调大 */
}


/* 编辑按钮容器 */
.profile-actions {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  margin-top: 1rem;
}

/* 编辑按钮 */
.edit-profile-btn {
  background-color: #2196F3; /* 蓝色背景 */
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

/* 悬停效果 */
.edit-profile-btn:hover {
  background-color: #1976D2; /* 深蓝色 */
  transform: translateY(-2px);
}

/* 按钮图标 */
.edit-profile-btn::before {
  content: "\1F589"; /* 笔形图标 */
  margin-right: 0.5rem;
  font-size: 1.2rem;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.edit-field {
  margin-bottom: 1.5rem;
}

.edit-field label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.edit-field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.save-btn {
  background-color: #2196F3;
  color: white;
}

.cancel-btn {
  background-color: #ccc;
}
/* 员工信息弹窗 */
.employee-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.employee-detail-modal .modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  animation: fadeIn 0.3s ease;
}

.employee-detail-row {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.detail-label {
  font-weight: bold;
  color: #333;
  min-width: 80px;
}

.detail-value {
  color: #555;
  flex: 1;
  padding-left: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.close-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
}

.close-btn::before {
  content: "\1F5D9"; /* 叉图标 */
  margin-right: 0.5rem;
  font-size: 1.2rem;
}
</style>
