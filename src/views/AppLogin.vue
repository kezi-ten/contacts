<template>
  <div class="login-container">
    <h2>登录页面</h2>
    <form @submit.prevent="login">
      <div class="input-group">
        <label for="username">用户名：</label>
        <input type="text" id="username" v-model="username" required />
      </div>

      <div class="input-group">
        <label for="password">密码：</label>
        <input type="password" id="password" v-model="password" required />
      </div>

      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script>

import axios from 'axios'; // 引入 axios

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async login() { // 改为异步方法
      try {
      
const response = await axios.post('http://localhost:8082/login', {
          username: this.username,
          password: this.password
        });

        if (response.data.code === 1) {
          alert('登录成功');
          localStorage.setItem('token', response.data.data.token); // 存储 token
          this.$router.push('/home'); // 跳转首页（需确保已配置 Vue Router）
        } else {
          alert('登录失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('请求失败:', error);
        alert('网络错误，请稍后再试');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>