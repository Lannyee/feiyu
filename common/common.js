/**
 * @author Lanny
 * @time 2021.09.14
 * @desc 公共方法
 */



import { baseUrl } from "@/common/baseUrl"



export default {

    /**
     * 判断一个(字符串,数组,对象)是否为空
     * @param {Object} param 需要判断的值
     */
    isEmpty(param) {
        if (typeof param == 'boolean' || typeof param == 'number') {
            return false;
        }
        if (param == '' || param == [] || param == null || param == {} || param == undefined) {
            return true;
        } else {
            return false;
        }
    },



    /**
     * 判断一个(字符串,数组,对象)是否不为空
     * @param {Object} param 需要判断的值
     */
    isNotEmpty(param) {
        if (this.isEmpty(param)) {
            return false;
        } else {
            return true;
        }
    },



    /**
     * 判断一个字符串为数字
     * @param {String} number 需要判断的值
     * @param {Boolean} isZero 是否允许为0(默认允许)
     */
    isNumber(number, isZero = true) {
        if (this.isEmpty(number) || Number.isNaN(parseFloat(number))) {
            return false;
        } else {
            if (isZero) {
                return true;
            } else {
                if (parseFloat(number) == 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    },



    /**
     * 根据平台ID返回平台LOGO
     * @param {String} platformId 平台ID
     * @returns {String} 平台LOGO
     */
    getPlatformLogo(platformId) {
        if (platformId == '1') {
            return '/static/images/platform/icon04.png';
        } else if (platformId == '2') {
            return '/static/images/platform/icon03.png';
        } else if (platformId == '3') {
            return '/static/images/platform/icon07.png';
        } else if (platformId == '4') {
            return '/static/images/platform/icon05.png';
        } else if (platformId == '5') {
            return '/static/images/platform/icon02.png';
        } else if (platformId == '6') {
            return '/static/images/platform/icon01.png';
        } else if (platformId == '7') {
            return '/static/images/platform/icon06.png';
        } else {
            return '/static/images/platform/default.png';
        }
    },



    /**
     * 根据平台ID返回平台Name
     * @param {String} platformId 平台ID
     * @returns {String} 平台Name
     */
    getPlatformName(platformId) {
        if (platformId == '1') {
            return '抖音';
        } else if (platformId == '2') {
            return '小红书';
        } else if (platformId == '3') {
            return '淘宝';
        } else if (platformId == '4') {
            return '微博';
        } else if (platformId == '5') {
            return '快手';
        } else if (platformId == '6') {
            return '微信';
        } else if (platformId == '7') {
            return 'B站';
        } else {
            return 'NULL';
        }
    },



    /**
     * 通过usertoken判断用户是否需要登录
     * @param {JSON} url 登录成功后跳转的页面路径
     * @param {JSON} params 登录成功后跳转的页面路径所携带的参数
     * @param {Function} callBack 回调函数
     */
    checkLogin(vm, url, params, callBack) {
        let usertoken = uni.getStorageSync('usertoken');
        if (usertoken) {
            callBack && callBack();
        } else {
            vm.$u.route('/pages/login/login', {
                url,
                params: JSON.stringify(params)
            });
        }
    },



    /**
     * 通过获取用户信息判断是否登录
     * @param {Function} callBack 回调函数
     * @param {Boolean} isToLogin 是否跳转到登录页(默认不跳转)
     */
    getCustomer(vm, callBack, isToLogin = false) {
        let usertoken = uni.getStorageSync('usertoken');
        if (usertoken) {
            vm.$u.post('/getCustomerInfo').then(res => {
                if (this.isEmpty(res.data) || this.isEmpty(res.data.id)) {
                    uni.removeStorageSync('usertoken');
                    uni.removeStorageSync('usertokenTime');

                    callBack && callBack();
                } else {
                    callBack && callBack(res.data);
                }
            });
        } else {
            if (isToLogin) {
                vm.$u.route({
                    type: 'reLaunch',
                    url: '/pages/login/login'
                });
            } else {
                callBack && callBack();
            }
        }
    },



    /**
     * navbar回到上一页
     * @param {String} url 没有上一页时路由跳转路径(默认首页)
     */
    navbarGoBack(vm, url = '/pages/home/home') {
        let pages = getCurrentPages();
        if (pages.length == 1) {
            vm.$u.route({
                type: 'reLaunch',
                url: url
            });
        } else {
            vm.$u.route({
                type: 'back'
            });
        }
    },



    /**
     * 预览图片
     * @param {Array} urls 需要预览的图片链接列表
     * @param {String} current 为当前显示图片的链接/索引值
     * @param {Boolean} isParse 是否需要解析urls(默认需要)
     */
    previewImage(urls, current, isParse = true) {
        let pictures = [];
        if (isParse) {
            for (let item of urls) {
                pictures.push(item.url);
            }
        } else {
            pictures = urls;
        }
        uni.previewImage({
            urls: pictures,
            current
        })
    },



    /**
     * 删除图片
     * @param {Array} urls 需要删除的图片链接列表
     * @param {String} current 为当前删除图片的索引值
     * @param {Boolean} isVideo 是否删除视频
     */
    deletePicture(urls, current, isVideo = false) {
        let toastText = '确定要删除该图片吗？';
        if (isVideo) {
            toastText = '确定要删除该视频吗？';
        }
        urls.splice(current, 1);
        let index = 0;
        for (let item of urls) {
            item.index = index;
            index++;
        }
    },



    /**
     * 选择图片上传
     * @param {Array} urls 上传成功后的图片链接列表
     * @param {Number} count 最多可以选择的图片张数(默认1张)
     * @param {String} type 上传图片前是否需要删除已存在的图片 [push | replace]
     */
    uploadPicture(urls, count = 1, type = 'push') {
        uni.chooseImage({
            count: count,
            success: res => {
                let index = 0;
                if (type == 'push') {
                    index = urls.length;
                }
                let tempFilePaths = res.tempFilePaths;
                for (let i = index, n = 0; n < tempFilePaths.length; i++, n++) {
                    if (type == 'replace') {
                        urls.splice(0, urls.length);
                    }
                    urls.push({
                        index: i, //文件在当前集合中的索引
                        url: tempFilePaths[n], //临时文件地址
                        successUrl: '', //上传文件成功地址
                        isSuccess: false, //是否上传成功
                        isChange: true, //是否可以删除
                        uploadStatus: 'ing' //上传状态[ing, success, error]
                    });
                    this.uploadFile(tempFilePaths[n], data => {
                        urls[i].successUrl = data;
                        urls[i].isSuccess = true;
                        urls[i].uploadStatus = 'success';
                    }, () => {
                        urls[i].uploadStatus = 'error';
                    })
                }
            }
        });
    },



    /**
     * 选择视频上传
     * @param {Array} urls 上传成功后的视频链接列表
     */
    uploadVideo(urls) {
        uni.chooseVideo({
            count: 1,
            success: res => {
                let tempFilePath = res.tempFilePath;
                urls.splice(0, urls.length);
                urls.push({
                    index: 0, //文件在当前集合中的索引
                    url: tempFilePath, //临时文件地址
                    successUrl: '', //上传文件成功地址
                    isSuccess: false, //是否上传成功
                    isChange: true, //是否可以删除
                    uploadStatus: 'ing' //上传状态[ing, success, error]
                });
                this.uploadFile(tempFilePath, data => {
                    urls[0].successUrl = data;
                    urls[0].isSuccess = true;
                    urls[0].uploadStatus = 'success';
                }, () => {
                    urls[0].uploadStatus = 'error';
                })
            }
        });
    },



    /**
     * 重新上传图片(只能重新上传1张图片)
     * @param {Array} urls 上传成功后的图片链接列表
     * @param {Number} index 需要重新上传的图片索引
     */
    reloadPicture(urls, index) {
        if (urls[index].uploadStatus == 'error') {
            urls[index].uploadStatus = 'ing';
            this.uploadFile(urls[index].url, data => {
                urls[index].successUrl = data;
                urls[index].isSuccess = true;
                urls[index].uploadStatus = 'success';
            }, () => {
                urls[index].uploadStatus = 'error';
            })
        }
    },



    /**
     * 上传文件
     * @param {String} url 需要上传的图片的地址路径
     * @param {Function} successCallBack 成功回调函数
     * @param {Function} errorCallBack 失败回调函数
     */
    uploadFile(url, successCallBack, errorCallBack) {
        uni.uploadFile({
            url: baseUrl + '/common/upload',
            filePath: url,
            name: 'file',
            success: res => {
                if (this.isNotEmpty(res.data)) {
                    let result = JSON.parse(res.data);
                    if (result && result.code == 0) {
                        successCallBack && successCallBack(result.data.url);
                    } else {
                        if (result.msg) {
                            uni.showToast({
                                icon: 'none',
                                title: result.msg
                            })
                        } else {
                            uni.showToast({
                                icon: 'none',
                                title: '上传失败'
                            })
                        }
                        errorCallBack && errorCallBack();
                    }
                } else {
                    uni.showToast({
                        icon: 'none',
                        title: '上传失败'
                    })
                    errorCallBack && errorCallBack();
                }
            },
            fail: error => {
                uni.showToast({
                    icon: 'none',
                    title: '请求失败'
                })
                errorCallBack && errorCallBack();
            }
        })
    },



    /**
     * 校验图片是否上传成功
     * @param {Array} pictures 需要校验图片列表
     * @param {String} toast toast提示文字
     */
    isPictureUpload(pictures, toast) {
        for (let item of pictures) {
            if (item.uploadStatus == 'ing') {
                uni.showToast({
                    icon: 'none',
                    title: toast + '还在上传中'
                })
                return false;
            } else if (item.uploadStatus == 'error') {
                uni.showToast({
                    icon: 'none',
                    title: '请重新上传' + toast
                })
                return false;
            }
        }
        return true;
    },



    /**
     * 将图片路径字符串格式转化为Array
     * @param {String} path 需要转化的图片路径
     * @param {Boolean} isChange 是否可以重新上传(默认可以)
     * @return {Array} 转换后的数据
     */
    pictureToArray(path, isChange = true) {
        let paths = [];
        if (this.isNotEmpty(path)) {
            let index = 0;
            for (let item of path.split(',')) {
                paths[index] = {
                    index: index,
                    url: item,
                    successUrl: item,
                    isSuccess: true,
                    isChange: isChange,
                    uploadStatus: 'success'
                }
                index++;
            }
        }
        return paths;
    },



    /**
     * 将图片路径数组格式转化为String
     * @param {Array} paths 需要转化的图片路径数组
     * @return {String} 转换后的数据
     */
    pictureToString(paths) {
        let path = '';
        for (let item of paths) {
            if (item.isSuccess && item.successUrl) {
                if (path) {
                    path += ',' + item.successUrl;
                } else {
                    path += item.successUrl;
                }
            }
        }
        return path;
    },



    /**
     * 分页请求公共方法封装
     * @param {String} url 请求接口地址
     * @param {Object} request 请求对象
     * @param {Function} itemCallBack 对请求数据的特殊处理
     * @param {Function} returnCallBack 请求完成回调
     */
    requestResultRender(vm, url, request, itemCallBack, returnCallBack) {
        if (request.load.loadStatus == 'loadmore') {
            request.load.loadStatus = 'loading';
            if (request.page.pageNum == 1 && request.refresher.isClear) {
                request.resultList = [];
            }
            vm.$u.post(url, Object.assign({
                pageNum: request.page.pageNum,
                pageSize: 10
            }, request.requestParam)).then(res => {
                request.page.pageCount = res.page.pageCount;
                if (request.page.pageNum == 1 && !request.refresher.isClear) {
                    request.resultList = [];
                }
                if (url == '/getCelebrityPageList') {
                    for (let item of res.data.celebrityList) {
                        if (itemCallBack) {
                            item = itemCallBack(item);
                        }
                        request.resultList.push(item);
                    }
                    // if (request.fieldList.length == 0) {
                    //     for (let item of res.data.fieldList) {
                    //         request.fieldList.push(item);
                    //     }
                    // }
                } else {
                    for (let item of res.data) {
                        if (itemCallBack) {
                            item = itemCallBack(item);
                        }
                        request.resultList.push(item);
                    }
                }
                request.page.pageNum++;
                request.load.loadStatus = 'loadmore';
                if (request.page.pageCount <= request.resultList.length) {
                    request.load.loadStatus = 'nomore';
                }
                if (!request.load.isLoadOver) {
                    request.load.isLoadOver = true;
                }
                returnCallBack && returnCallBack();
            });
        }
    },



    /**
     * 通过tryType获取其对应的中文意思(悬赏类型)
     * @param {String} tryType 试用商品悬赏类型
     * @param {String} type 区分[title]和[content]的区别
     * @return {String} 返回处理过的值
     */
    getTryType(tryType, type) {
        if (type == 'content') {
            if (tryType == '1') {
                return '免费试用';
            } else if (tryType == '2') {
                return '悬赏试用';
            } else if (tryType == '3') {
                return 'KOL悬赏';
            } else if (tryType == '4') {
                return '拍单合作';
            }
            return '';
        }
    },


    
    /**
     * 通过page路径获取路由跳转类型
     * @param {String} url 路由跳转路径
     * @return {String} 路由跳转类型
     */
    getRouteType(url) {
        if (url.indexOf('home/home') != -1 || url.indexOf('task/task') != -1 || url.indexOf('celebrity/celebrity') != -1 || url.indexOf('customer/customer') != -1) {
            return 'tab';
        }
        return 'to';
    },



    /**
     * 改变试用商品状态时将商品信息存入缓存(申请商品 & 取消申请)
     * @param {String} goodsId 商品ID
     * @param {String} goodsStatus 商品状态
     */
    setChangeGoods(goodsId, goodsStatus) {
        let changeGoods = uni.getStorageSync('changeGoods');
        let hasGoods = false;
        if (this.isNotEmpty(changeGoods)) {
            for (let item of changeGoods) {
                if (item.goodsId == goodsId) {
                    item.goodsStatus = goodsStatus;
                    hasGoods = true;
                    break;
                }
            }
        } else {
            changeGoods = [];
        }
        if (!hasGoods) {
            changeGoods.push({
                goodsId: goodsId,
                goodsStatus: goodsStatus
            })
        }
        uni.setStorageSync('changeGoods', changeGoods);
    },



    /**
     * 订阅消息
     * @param {String} type 订阅消息模板类型
     * @param {Function} callBack 回调函数
     */
    getTemplate(vm, type, callBack) {
        vm.$u.post('/getTemplate', {
            type
        }).then(res => {
            if (this.isNotEmpty(res.data)) {
                let tmplIds = [];
                for (let item of res.data) {
                    tmplIds.push(item.dataValue);
                }
                uni.requestSubscribeMessage({
                    tmplIds,
                    complete: () => {
                        callBack && callBack();
                    }
                })
            } else {
                callBack && callBack();
            }
        }, error => {
            callBack && callBack();
        });
    },



    /**
     * 获取navbar高度
     * @param {Function} callBack 回调函数
     */
    getNavbarHeight(callBack) {
        let navbarHeight = 0;
        uni.getSystemInfo({
            success: res => {
                if (res.platform == 'ios') {
                    navbarHeight = 44;
                } else {
                    navbarHeight = 48;
                }
                if (this.isNumber(res.statusBarHeight)) {
                    navbarHeight += parseInt(res.statusBarHeight);
                }
                callBack && callBack(navbarHeight);
            }
        })
    },


    
    /**
     * tabbar个人中心右上角添加文本
     */
    renderTabBarBadgeCustomer(data) {
        let index = 2;
        if (this.isNotEmpty(data)) {
            if (this.isNumber(data.disposeNum, false)) {
                uni.setTabBarBadge({
                    index,
                    text: data.disposeNum + ''
                })
            } else {
                uni.removeTabBarBadge({
                    index
                });
            }
        } else {
            uni.removeTabBarBadge({
                index
            });
        }
    },



    /**
     * 小程序更新
     */
    updateManager() {
        const updateManager = uni.getUpdateManager();
        updateManager.onCheckForUpdate(res => {
            if (res.hasUpdate) {
                updateManager.onUpdateReady(res => {
                    uni.showModal({
                        title: '提示',
                        content: '新版本已经准备好，是否重启应用？',
                        showCancel: false,
                        success: res => {
                            updateManager.applyUpdate();
                        }
                    });
                })

                updateManager.onUpdateFailed(res => {
                    uni.showModal({
                        title: '提示',
                        content: '新版本已经上线啦，请您删除当前小程序，重新搜索打开',
                        showCancel: false
                    });
                })
            }
        })
    }
    
}
