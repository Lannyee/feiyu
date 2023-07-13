/**
 * @author Lanny
 * @time 2021.09.22
 * @desc 请求处理
 */



import md5Libs from "@/uview-ui/libs/function/md5"
import { baseUrl } from "@/common/baseUrl"



/**
 * 请求参数加密处理(把参数转化为字符串时需要先根据参数名称的字符编码进行排序)
 * @param {Object} data 请求参数
 * @param {Boolean} isEncrypt 是否加密请求参数(默认加密)
 * @return {String} 返回加密后的数据
 */
function getEncryption(vm, data, isEncrypt = true) {
    if (vm.$common.isNotEmpty(uni.getStorageSync('usertoken'))) {
        data.usertoken = uni.getStorageSync('usertoken');
    }
    if (isEncrypt) {
        // 网站接口设定的密钥
        data.key = 'WjOYfohLi4rOcU3DD9NdI8MKHj5dK6eW';
        let queryData = '';
        for (let item of Object.keys(data).sort()) {
            if (vm.$common.isNotEmpty(data[item])) {
                if (queryData) {
                    queryData += '&' + item + '=' + data[item];
                } else {
                    queryData += item + '=' + data[item];
                }
            } else {
                delete data[item];
            }
        }
        // 处理emoji表情符号问题(前后端统一先转成URL编码再md5加密)
        let returnData = encodeURIComponent(queryData);
        // 个别字符前后端兼容处理
        returnData = returnData.replace(/%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/~/g, '%7E');
        data.sign = md5Libs.md5(returnData);
        delete data.key;
    }
    return data;
}



const install = (Vue, vm) => {
    Vue.prototype.$u.http.setConfig({
        baseUrl,
        showLoading: true,
        loadingTime: 500,
        loadingMask: true,
        loadingText: '加载中',
        originalData: true,
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    })

    Vue.prototype.$u.http.interceptor.request = (config) => {
        if (config.url == '/getBannerList' || config.url == '/getOneBanner') {
            Vue.prototype.$u.http.setConfig({
                baseUrl: baseUrl + '/common'
            })
        } else if (config.url == '/submitFeedback') {
            Vue.prototype.$u.http.setConfig({
                baseUrl: baseUrl + '/html'
            })
        } else {
            Vue.prototype.$u.http.setConfig({
                baseUrl: baseUrl + '/interfaces/wechat'
            })
        }

        config.data = getEncryption(vm, config.data);
        return config;
	}

    Vue.prototype.$u.http.interceptor.response = response => {
        if (response.statusCode == 200) {
            let result = response.data;
            if (result.code == 0) {
                return result;
            } else {
                uni.showToast({
                    icon: 'none',
                    title: result.msg
                })
                if (result.msg == '请先登录') {
                    vm.$u.route({
                        type: 'reLaunch',
                        url: '/pages/login/login'
                    });
                }
                return false;
            }
        } else {
            vm.$u.route({
                type: 'reLaunch',
                url: '/pages/fail/fail'
            });
        }
    }
}



export default {
    install
}