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
    <img 
      :src="dynamicImage2" 
      alt="动态图片" 
      class="dynamic-image"
    >
    <!-- 页面内容过渡动画 -->
    <transition name="fade">
      <div>
        <!-- 使用 v-show 控制当前显示的视图 -->
        <div v-show="currentView === 'contacts'" class="view contacts-view">
           <!-- 搜索栏 -->
           <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入员工工号或姓名搜索"
        @input="filterEmployees"
      />
    </div>
          <!-- 通讯录视图 -->
          <div v-for="(dept) in filteredDepartments" :key="dept.name" class="department">
      <div class="dept-header" @click="toggle(dept.name)">
        {{ dept.name }} (共 {{ dept.employees.length }} 人)
        <span>{{ dept.isOpen ? '▼' : '▶' }}</span>
      </div>
      <transition name="slide">
        <div v-show="dept.isOpen" class="employee-list">
          <ul>
            <!-- 使用员工工号作为 key -->
            <li v-for="emp in dept.employees" :key="emp.emp_id">
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
          <p>当前为管理员视角，可管理用户和部门~</p>
          <div class="admin-actions">
            <button @click="showAddDepartmentModal = true">新增部门</button>
            <button @click="showAddEmployeeModal = true">新增员工</button>
            <!-- 新增批量导入按钮 -->
        <button @click="handleBatchImport">批量导入</button>

          </div>

          <!-- 部门列表 -->
          <div class="department-list">
            <h4>部门列表</h4>
          <div class="admin-actions">
      <!-- 为按钮添加鼠标事件 -->
      <button 
        @mouseenter="showChart = true" 
        @mouseleave="showChart = false"
      >人员总览</button>
    </div>
    <!-- 图表容器 -->
    <div v-if="showChart" class="chart-container">
      <div ref="chart" style="width: 400px; height: 300px;"></div>
    </div>
            <ul>
              <li v-for="dept in departments" :key="dept.name">
                <span>{{ dept.name }} (总管: {{  getDepartmentManager(dept.name) || '无' }})</span>
                <div class="dept-actions">
                  <button @click="editDepartment(dept)">编辑</button>
                
                </div>
              </li>
            </ul>
          </div>

          <!-- 员工列表 -->
          <div class="employee-list">
            <h4>员工列表</h4>
            <table>
              <thead>
                <tr>
                  <th>工号</th>
                  <th>姓名</th>
                  <th>部门
                    <select v-model="selectedDepartmentFilter" class="filter-select">
        <option v-for="dept in departmentsFilterOptions" :key="dept" :value="dept">{{ dept }}</option>
      </select>
                  </th>

                  <th>职位
                    <select v-model="selectedPositionFilter" class="filter-select">
        <option v-for="pos in positionsFilterOptions" :key="pos" :value="pos">{{ pos }}</option>
      </select>
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in paginatedEmployees" :key="emp.emp_id">
                  <td>{{ emp.emp_id }}</td>
                  <td>{{ emp.name }}</td>
                  <td>{{ emp.department }}</td>
                  <td>{{ emp.position }}</td>
                  <td>
                    <button @click="editEmployee(emp)">编辑</button>
                    <button @click="deleteEmployee(emp.emp_id)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
                 <div class="pagination">
                     <button @click="currentPage = 1" :disabled="currentPage === 1">首页</button>
                      <button @click="currentPage--" :disabled="currentPage === 1">上一页</button>
                      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                  <button @click="currentPage++" :disabled="currentPage === totalPages">下一页</button>
                <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">尾页</button>
                </div>
          </div>

          <!-- 新增部门模态框 -->
          <div v-if="showAddDepartmentModal" class="modal">
            <div class="modal-content">
              <h3>新增部门</h3>
              <div class="edit-field">
                <label>部门名称：</label>
                <input v-model="newDepartment.name" type="text" placeholder="请输入部门名称">
              </div>
              <div class="edit-field">
                <label>部门总管工号：</label>
                <input v-model="newDepartment.supervisor_id" type="text" placeholder="请输入总管工号">
              </div>
              <div class="modal-actions">
                <button @click="addDepartment" class="save-btn">保存</button>
                <button @click="showAddDepartmentModal = false" class="cancel-btn">取消</button>
              </div>
            </div>
          </div>

          <!-- 编辑部门模态框 -->
          <div v-if="showEditDepartmentModal" class="modal">
            <div class="modal-content">
              <h3>编辑部门</h3>
              <div class="edit-field">
                <label>部门名称：</label>
                <input v-model="editingDepartment.name" type="text">
              </div>
              <div class="modal-actions">
                <button @click="updateDepartment" class="save-btn">保存</button>
                <button @click="showEditDepartmentModal = false" class="cancel-btn">取消</button>
              </div>
            </div>
          </div>

          <!-- 新增员工模态框 -->
          <div v-if="showAddEmployeeModal" class="modal">
            <div class="modal-content">
              <h3>新增员工</h3>
              <div class="edit-field">
                <label>工号：</label>
                <input v-model="newEmployee.emp_id" type="text" placeholder="请输入工号">
              </div>
              <div class="edit-field">
                <label>姓名：</label>
                <input v-model="newEmployee.name" type="text" placeholder="请输入姓名">
              </div>
              <div class="edit-field">
                <label>部门：</label>
                <select v-model="newEmployee.department_id" class="position-select">
                  <option value="待分配">待分配</option>
                  <option v-for="dept in departments" :key="dept.name" :value="dept.name">{{ dept.name }}</option>
                </select>
              </div>
             <div class="edit-field">
               <label>职位：</label>
               <select v-model="newEmployee.position" class="position-select">
                  <option value="普通员工">普通员工</option>
               </select>
             </div>
              <div class="edit-field">
                <label>密码：</label>
                <input v-model="newEmployee.password" type="password" placeholder="密码">
              </div>
              <div class="modal-actions">
                <button @click="addEmployee" class="save-btn">保存</button>
                <button @click="showAddEmployeeModal = false" class="cancel-btn">取消</button>
              </div>
            </div>
          </div>

          <!-- 编辑员工模态框 -->
          <div v-if="showEditEmployeeModal" class="modal">
            <div class="modal-content">
              <h3>编辑员工</h3>
              <div class="edit-field">
                <label>工号：</label>
                <input v-model="editingEmployee.emp_id" type="text" disabled>
              </div>
              <div class="edit-field">
                <label>姓名：</label>
                <input v-model="editingEmployee.name" type="text">
              </div>
              <div class="edit-field">
                <label>部门：</label>
                <select v-model="editingEmployee.department_id" class="position-select">
                  <option v-for="dept in departments" :key="dept.name" :value="dept.name">{{ dept.name }}</option>
                </select>
              </div>
              <div class="edit-field">
                <label>职位：</label>
               <select v-model="editingEmployee.position" class="position-select">
                    <option value="普通员工">普通员工</option>
                    <option value="部门总管">部门总管</option>
                </select>
              </div>
              <div class="edit-field">
                <label>新密码：</label>
                <input v-model="editingEmployee.password" type="password" placeholder="不填则使用原密码">
              </div>
              <div class="modal-actions">
                <button @click="updateEmployee" class="save-btn">保存</button>
                <button @click="showEditEmployeeModal = false" class="cancel-btn">取消</button>
              </div>
            </div>
          </div>
        </div>
        <img 
      :src="dynamicImage" 
      alt="动态图片" 
      class="dynamic-image"
    >
      </div>
    </transition>

  </div>
</template>

<script>
import dynamicImage from '@/assets/4471dcf746b24b738e0c5d7561dd2839.gif';
import dynamicImage2 from '@/assets/c33ae2fae8c44fb589950998abfb5b36.gif';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';
import { generateSignatureWithTimestamp } from '@/utils/signature';
import * as echarts from 'echarts';



export default {
  name: 'HomeView',
  data() {
    return {
      dynamicImage2: dynamicImage2,
      dynamicImage: dynamicImage,
      emp_id: '',
      departments: [],
      password: '',
      currentUser: null, // 用于保存当前登录用户的信息
      allEmployees: [] ,// 存储所有员工数据
       currentView: 'contacts' ,// 默认显示通讯录
       showEditModal: false ,// 控制模态框显示
       selectedEmployee: null, // 新增：用于存储选中的员工信息
       searchKeyword: '', // 搜索关键词
        filteredDepartments: [] ,// 过滤后的部门数据
        showAddDepartmentModal: false,
      showEditDepartmentModal: false,
      showAddEmployeeModal: false,
      showEditEmployeeModal: false,
      isAdmin: false,
      newDepartment: {
        name: '',
        supervisor_id: ''
      },
      editingDepartment: {
        name: '',
        supervisor_id: ''
      },
      newEmployee: {
        emp_id: '',
        name: '',
        department_id: '',
        position: '',
        password: ''
      },
      editingEmployee: {
        emp_id: '',
        name: '',
        department_id: '',
        position: '',
        password: ''
      },
      originalPassword: '',
        currentPage: 1,         // 当前页码
    itemsPerPage: 10,       // 每页显示条数
    selectedDepartmentFilter: '全部', // 当前选择的部门筛选
    selectedPositionFilter: '全部',   // 当前选择的职位筛选
    positionsFilterOptions: ['全部', '普通员工', '部门总管'],
    showChart: false, // 控制图表显示
      chartInstance: null // 存储 ECharts 实例
    };
  },
  async mounted() {
    this.emp_id = localStorage.getItem('emp_id') || '游客';
     // 获取员工数据和管理员列表
  await Promise.all([
    this.fetchEmployees(),
    this.getCurrentUser()
    
  ]);
    this.fetchEmployees().then(() => {
    this.getCurrentUser();
    this.filteredDepartments = this.departments; // 初始化过滤数据
  });

  },
  computed: {
    filteredEmployees() {
    return this.allEmployees.filter(emp => {
      const deptMatch = this.selectedDepartmentFilter === '全部' || emp.department === this.selectedDepartmentFilter;
      const positionMatch = this.selectedPositionFilter === '全部' || emp.position === this.selectedPositionFilter;
      return deptMatch && positionMatch;
    });
  },
  paginatedEmployees() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEmployees.slice(start, end);
  },
  totalPages() {
    return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
  },

    
  departmentsFilterOptions() {
    const depts = this.departments.map(d => d.name);
    return ['全部', ...depts];
  
}
  },
  watch: {
showChart(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initChart();
        });
      } else if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
    },
  selectedDepartmentFilter() {
    this.currentPage = 1;
  },
  selectedPositionFilter() {
    this.currentPage = 1;
  },
  departments: {
      handler() {
        if (this.chartInstance) {
          this.initChart();
        }
      },
      deep: true
    }
},
  methods: {

 encryptPassword(password) {
    return CryptoJS.SHA256(password).toString();}, // 使用 SHA-256 加密
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
  phone: emp.phone || '未填写',
  password: emp.password || ''    

    }));
 processedData.sort((a, b) => parseInt(a.emp_id) - parseInt(b.emp_id));

    this.allEmployees = processedData;
    this.groupByDepartment(processedData);
  } catch (error) {
    console.error('请求员工数据失败:', error);
    ElMessage.error('您的登录已过期，请重新登录。');
    this.$router.push('/login');

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
       this.filteredDepartments = this.departments; // 初始化过滤数据
    },
 // 过滤员工数据
      filterEmployees() {
      const keyword = this.searchKeyword.toLowerCase();
      console.log('当前搜索关键词:', keyword);
      if (!keyword) {
        this.filteredDepartments = [...this.departments]; 
        console.log('关键词为空，显示全部数据');
      } else {
        const newFilteredDepartments = this.departments.map(dept => {
          const filteredEmployees = dept.employees.filter(emp => {
            const match = emp.emp_id.toLowerCase().includes(keyword) || emp.name.toLowerCase().includes(keyword);
            console.log(`员工 ${emp.name} (工号: ${emp.emp_id}) 是否匹配: ${match}`);
            return match;
          });
          return {
            ...dept,
            employees: filteredEmployees
          };
        }).filter(dept => dept.employees.length > 0);
        // 使用解构赋值确保响应式更新
        this.filteredDepartments = [...newFilteredDepartments]; 
        console.log('过滤后的部门数据:', this.filteredDepartments);
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
      const payload = {
    emp_id: this.currentUser.emp_id,
    phone: this.currentUser.phone,
    email: this.currentUser.email
  };

     const { signature, timestamp } = generateSignatureWithTimestamp(payload);
    try {
      // 调用后端更新接口
      const response = await axios.post('http://localhost:8082/update', payload,
  {headers: {
    Authorization: `Bearer ${token}`,
    'X-Signature': signature,
        'X-Timestamp': timestamp
  
  }},);
      
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
  },
  toggle(deptName) {
      const dept = this.filteredDepartments.find(d => d.name === deptName);
      if (dept) {
        dept.isOpen = !dept.isOpen;
      }
    },

async enterAdminMode() {
  const token = sessionStorage.getItem('token');
  
  try {
    // 先向后端验证权限
    const response = await axios.post('http://localhost:8082/checkAdmin', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.code === 1 && response.data.data==true) {
      this.isAdmin = true;
      ElMessage.success('欢迎管理员~');
      this.currentView = 'admin';
      this.fetchEmployees();
    } else {
      this.isAdmin = false;
      ElMessage.error('您没有管理员权限');
    }
  } catch (error) {
    console.error('权限验证失败:', error);
    ElMessage.error('权限验证失败，请重新登录');
  }
},
    
    async addDepartment() {
      const token = sessionStorage.getItem('token');
      const payload = {
    name: this.newDepartment.name,
    supervisor_id: this.newDepartment.supervisor_id
  };
       const { signature, timestamp } = generateSignatureWithTimestamp(payload);
      try {
        const response = await axios.post('http://localhost:8082/addDepartment', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Signature': signature,
        'X-Timestamp': timestamp
          }
        });
        if (response.data.code === 1) {
          ElMessage.success('新增部门成功');
          this.showAddDepartmentModal = false;
          this.newDepartment = {
            name: '',
            supervisor_id: ''
          };
          // 重新获取员工和部门数据
          this.fetchEmployees();
        } else {
          ElMessage.error('新增部门失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('新增部门失败:', error);
        ElMessage.error('网络错误，请稍后再试');
      }
    },
    editDepartment(dept) {
  
  this.editingDepartment = { 
    ...dept,
    originalName: dept.name  
  };
  this.showEditDepartmentModal = true;
},
    async updateDepartment() {
      const token = sessionStorage.getItem('token');
       const oldName = this.editingDepartment.originalName; 
  const newName = this.editingDepartment.name;       
       const payload = {
    oldName,  // 原部门名
    newName   // 新部门名
  };
  const { signature, timestamp } = generateSignatureWithTimestamp(payload);


      try {
        const response = await axios.post('http://localhost:8082/updateDepartment', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
             'X-Signature': signature,
        'X-Timestamp': timestamp
          }
        });
       if (response.data.code === 1) {
      const { oldName, newName } = response.data.data;
      ElMessage.success(`部门名称从 "${oldName}" 更新为 "${newName}"`);
      this.showEditDepartmentModal = false;
      this.fetchEmployees(); // 重新获取数据
    } else {
      ElMessage.error('更新失败: ' + response.data.msg);
    }
  } catch (error) {
    console.error('更新部门信息失败:', error);
    ElMessage.error('网络错误，请稍后再试');
  }
},
   
    async addEmployee() {
      const token = sessionStorage.getItem('token');
    
      try {
        const encryptedPassword = this.encryptPassword(this.newEmployee.password);
        const payload = {
      emp_id: this.newEmployee.emp_id,
      name: this.newEmployee.name,
      department_id: this.newEmployee.department_id,
      position: this.newEmployee.position,
      password: encryptedPassword // 使用加密后的密码
    };
    const { signature, timestamp } = generateSignatureWithTimestamp(payload);
        const response = await axios.post('http://localhost:8082/addEmployee', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
             'X-Signature': signature,
        'X-Timestamp': timestamp
          }
        });
        if (response.data.code === 1) {
          ElMessage.success('新增员工成功');
          this.showAddEmployeeModal = false;
          this.newEmployee = {
            emp_id: '',
            name: '',
            department_id: '',
            position: '',
            password: ''
          };
          // 重新获取员工和部门数据
          this.fetchEmployees();
        } else {
          ElMessage.error('新增员工失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('新增员工失败:', error);
        ElMessage.error('添加失败，请检查工号是否重复');
      }
    },
     editEmployee(emp) {
      
this.editingEmployee = { ...emp, password: '' };
this.originalPassword = emp.password;
      this.showEditEmployeeModal = true;
    },
    async updateEmployee() {
      const token = sessionStorage.getItem('token');
   const newPassword = this.editingEmployee.password||this.originalPassword;
   console.log(this.originalPassword);
   const encryptedPassword =  this.editingEmployee.password
    ? this.encryptPassword(newPassword)
    : newPassword;
 
  const payload = {
    emp_id: this.editingEmployee.emp_id,
    name: this.editingEmployee.name,
    department_id: this.editingEmployee.department_id,
    position: this.editingEmployee.position,
    password: encryptedPassword  // 发送加密后的密码
  };
   const { signature, timestamp } = generateSignatureWithTimestamp(payload);
      try {
        const response = await axios.post('http://localhost:8082/updateEmployee', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Signature': signature,
        'X-Timestamp': timestamp
          }
        });
        if (response.data.code === 1) {
          ElMessage.success('更新员工信息成功');
          this.showEditEmployeeModal = false;
          // 重新获取员工和部门数据
          this.fetchEmployees();
        } else {
          ElMessage.error('更新员工信息失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('更新员工信息失败:', error);
        ElMessage.error('网络错误，请稍后再试');
      }
    },
    async deleteEmployee(emp_id) {
      const hasPermission = await this.verifyAdminPermission();
  if (!hasPermission) return;
      const token = sessionStorage.getItem('token');
      const payload = { emp_id };
  const { signature, timestamp } = generateSignatureWithTimestamp(payload);
  
      if (confirm('确定要删除该员工吗？')) {
        try {
          const response = await axios.post('http://localhost:8082/deleteEmployee', payload, {
            headers: {
              Authorization: `Bearer ${token}`,
               'X-Signature': signature,
        'X-Timestamp': timestamp
            }
          });
          if (response.data.code === 1) {
            ElMessage.success('删除员工成功');
            // 重新获取员工和部门数据
            this.fetchEmployees();
          } else {
            ElMessage.error('删除员工失败: ' + response.data.msg);
          }
        } catch (error) {
          console.error('删除员工失败:', error);
          ElMessage.error('网络错误，请稍后再试');
        }
      }},

  getDepartmentManager(deptName) {
    console.log('当前查找的部门名称:', deptName);
      const manager = this.allEmployees.find(emp => 
        emp.department === deptName && emp.position === '部门总管'
      );
      return manager ? manager.name : null;
    },

async verifyAdminPermission(){
  const token = sessionStorage.getItem('token');
  try {
    const response = await axios.post('http://localhost:8082/checkAdmin', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.code === 1 && response.data.data==true) {
      return true;
    } else {
      ElMessage.error('您没有管理员权限');
      return false;
    }
  } catch (error) {
     ElMessage.error('权限验证失败，请重新登录');
    return false;
  }
},
initChart() {
      const chartDom = this.$refs.chart;
      this.chartInstance = echarts.init(chartDom);

      const xData = this.departments.map(dept => dept.name);
      const yData = this.departments.map(dept => dept.employees.length);

      const option = {
        xAxis: {
          type: 'category',
          data: xData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: yData,
            type: 'bar'
          }
        ]
      };

      this.chartInstance.setOption(option);
    },
    handleBatchImport() {
      ElMessage.warning('功能暂未实现');
    }
  },

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
/* 搜索栏样式*/
.search-bar {
  margin-bottom: 1.5rem; /* 适当增加底部间距 */
  padding: 0.8rem 1.2rem; /* 增加上下内边距，让搜索框更饱满 */
  background: #fff; /* 设置白色背景 */
  border-radius: 2rem; /* 设置较大圆角，让搜索框呈胶囊形状 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加柔和阴影，增强立体感 */
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中内容 */
  transition: box-shadow 0.3s ease; /* 添加阴影过渡动画 */
}

.search-bar:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15); /* 悬停时增强阴影效果 */
}

.search-bar .el-input__inner {
  border: none; /* 移除 Element Plus 输入框默认边框 */
  outline: none; /* 移除聚焦时的轮廓线 */
  font-size: 1rem; /* 设置字体大小 */
  color: #333; /* 设置字体颜色 */
  flex: 1; /* 让输入框占满剩余空间 */
}

.search-bar .el-input__inner::placeholder {
  color: #999; /* 设置占位符颜色 */
}

.search-bar .el-input__prefix {
  margin-right: 0.6rem; /* 调整前缀图标右侧间距 */
}

.search-bar .el-input__prefix .el-icon {
  color: #666; /* 设置前缀图标颜色 */
  font-size: 1.2rem; /* 设置图标大小 */
}

/*guanli*/


.admin-view .admin-actions {
  margin-bottom: 1rem;
}

.admin-view .admin-actions button {
  margin-right: 0.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.admin-view .admin-actions button:hover {
  background-color: #1976D2;
}

.admin-view .department-list,
.admin-view .employee-list {
  margin-bottom: 2rem;
}

.admin-view .department-list ul {
  list-style-type: none;
  padding: 0;
}

.admin-view .department-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.admin-view .department-list li:last-child {
  border-bottom: none;
}

.admin-view .dept-actions button,
.admin-view .employee-list button {
  margin-left: 0.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}

.admin-view .dept-actions button:hover,
.admin-view .employee-list button:hover {
  background-color: #1976D2;
}

.admin-view table {
  width: 100%;
  border-collapse: collapse;
}

.admin-view th,
.admin-view td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.admin-view th {
  background-color: #f2f2f2;
}
.admin-view .dept-actions button:nth-child(2) {
  background-color: #f44336; /* 红色背景 */
}

.admin-view .dept-actions button:nth-child(2):hover {
  background-color: #d32f2f; /* 悬停时更深的红色 */
}

/* 员工操作中的删除按钮 */
.admin-view .employee-list button:nth-child(2) {
  background-color: #f44336; /* 红色背景 */
}

.admin-view .employee-list button:nth-child(2):hover {
  background-color: #d32f2f; /* 悬停时更深的红色 */
}

/* 员工详情弹窗中的删除按钮（如果有） */
.employee-detail-modal .modal-actions button:nth-child(2) {
  background-color: #f44336; /* 红色背景 */
}

.employee-detail-modal .modal-actions button:nth-child(2):hover {
  background-color: #d32f2f; /* 悬停时更深的红色 */
}
.position-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover {
  background-color: #e0e0e0;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
.filter-select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: #888;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.filter-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}
.dynamic-image {
  display: block;
  margin: 20px auto 0; /* 顶部留 20px 间距，水平居中 */
  max-width: 100%; /* 图片最大宽度不超过容器 */
  height: auto; /* 保持图片比例 */
}
.chart-container {
  position: fixed; /* 使用 fixed 定位，相对于浏览器窗口定位 */
  left: 50%; /* 左边缘位于窗口水平中心 */
  top: 50%; /* 上边缘位于窗口垂直中心 */
  transform: translate(-50%, -50%); /* 将容器自身向左和向上移动自身宽高的一半，实现完全居中 */
  z-index: 100;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 400px; 
  height: 300px;
}

.chart-container > div {
  width: 100%;
  height: 100%;
}
 .admin-actions button {
    margin-right: 10px;
  }
</style>
