import React from 'react';
import {U} from "../../common";
import App from "../../common/App";
import {Button, Card, Icon, message, Modal, Table, Tag} from "antd";
import Utils from '../../common/Utils'
import AddressUtils from ".././address/AddressUtils";
import "../../assets/css/order/ordertemp.scss"

export default class Address extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            oldTotal: 0,
            newTotal: 0,
            coupon: [],
            sorts: [],
            coupons: [],
            usercoupons: [],
            addrIndex: -1,
            userCouponId: -1,
            address: [],
            _ids: this.props.match.params.ids,
            ids: [],
            products: [],
            totalNum: 0,
            total: 0
        };
    }

    componentDidMount() {
        Utils.addr.loadRegion(this);
        U.setWXTitle('提交订单');
        this.loadData();
    }

    loadData = () => {

        let {_ids, ids, totalNum, total} = this.state;
        ids = decodeURIComponent(decodeURIComponent(_ids));
        ids = JSON.parse(ids);
        this.setState({ids});

        App.api(`/user/address/addresss`, {
            addressQo: JSON.stringify({})
        }).then((list) => {

            let addrIndex = list.length > 0 ? 0 : -1;

            this.setState({address: list, addrIndex});
        });

        App.api(`/user/car/findbyids`, {ids: JSON.stringify(ids)}).then((products) => {
            products.map((item) => {
                let {num, sno, product = {}} = item;
                let {productItems = []} = product;
                totalNum += parseInt(num);
                productItems.map((v) => {
                    if (v.sno === sno) {
                        let {price} = v;
                        total += parseInt(price * num);
                    }
                });
            });
            let oldTotal = total;
            total += 12;

            this.setState({total, totalNum, products, oldTotal, newTotal: oldTotal});
        });

        App.api('usr/coupon/usercoupons', {
            userCouponQo: JSON.stringify({notstatus: 2})
        }).then((usercoupons) => {
                this.setState({
                    usercoupons,
                });
            }
        );

        App.api('usr/home/coupons', {
            couponQo: JSON.stringify({})
        }).then((coupons) => {
                this.setState({
                    coupons,
                });
            }
        );

        App.api('/usr/home/sorts', {sortQo: JSON.stringify({})}).then((sorts) => {
                this.setState({
                    sorts
                });
            }
        );
    };

    removeCar = () => {

        let {coupons, userCouponId, ids = [], usercoupons = []} = this.state;

        let coupon = coupons[userCouponId];

        if (coupon !== undefined) {
            let exist = usercoupons.find(aa => aa.couponId === coupon.id);
            let {id} = exist;
            App.api(`/usr/coupon/used`, {id});
        }


        ids.map((id) => {
            App.api(`/user/car/remove`, {id})
        });
        App.go(`/user/order`);
    };

    remove = (id, index) => {
        Modal.confirm({
            title: `确认删除操作?`,
            onOk: () => {
                App.api(`/user/address/remove`, {id}).then((v) => {
                    if (v == null) {
                        message.success("删除成功");
                        let address = this.state.address;
                        this.setState({
                            address: U.array.remove(address, index)
                        })
                    }
                })
            },
            onCancel() {
            },
        });
    };

    edit = (Address) => {
        AddressUtils.EditAddress(Address, this.loadData);
    };

    def = (id) => {
        Modal.confirm({
            title: `确认设为默认地址?`,
            onOk: () => {
                App.api(`/user/address/def`, {id}).then(() => {
                    message.success("设置成功");
                    this.loadData();
                })
            }
        });
    };

    go = (id) => {
        let url = window.location.href;
        if (url.indexOf('106.14.81.141:1996') > -1) {
            window.open(`http://106.14.81.141:1996/market-pc/#/product/${id}`);
        } else {
            window.open(window.location.protocol + '//' + window.location.host + `#/product/${id}`);
        }
    };

    renderImg = (item) => {
        let {product = []} = item;
        let {productItems = []} = product;
        let imgs = productItems.length > 0 ? productItems[0].imgs : [];
        return <img key={imgs[0]} className='product-img' src={imgs[0] + '@!120-120'}
                    onClick={() => this.go(item.productId)}/>
    };

    order = () => {

        let {products, addrIndex, address, newTotal} = this.state;

        address = address[addrIndex];

        App.api('user/order/save', {
                order: JSON.stringify({
                    address,
                    products,
                    total: newTotal
                })
            }
        ).then(() => {
            message.success('订单已创建，请尽快付款哦亲');
            this.removeCar();
        });


    };

    count = (coupon) => {

        let {total} = this.state;
        let {price} = coupon;
        price = parseInt(price);
        total = parseInt(total - price);
        this.setState({newTotal: total})
    };

    render() {
        let {addrIndex = -1, address, products, newTotal, oldTotal, total, totalNum, usercoupons = [], coupons = [], sorts = [], userCouponId = -1, coupon = []} = this.state;
        let {price = 0} = coupon;
        let list = [];
        let newlist = [];
        let now = new Date().getTime();
        usercoupons.map((item) => {
            let {couponId, expirAt, status} = item;
            if (expirAt - now > 0) {
                if (status === 1) {
                    let exist = coupons.find(aa => aa.id === couponId);
                    list.push(exist);
                }
            }
        });
        list.map((item) => {

            if (item !== undefined) {
                let {rule = {}} = item;
                let {type, values = []} = rule;

                if (type !== 3) {
                    if (values[0] < total) {
                        newlist.push(item)
                    }
                }
            }

        });

        let sequence = '';
        products.map((item) => {
            let {product = {}} = item;
            let {sortId} = product;
            sorts.map((t1) => {
                if (t1.id === sortId) {
                    sequence = t1.sequence;
                }
                t1.children.map((t2) => {
                    if (t2.id === sortId) {
                        sequence = t2.sequence;
                    }
                    t2.children.map((t3) => {
                        if (t3.id === sortId) {
                            sequence = t3.sequence;
                        }
                    })
                })
            });
        });
        let newusercoupon = [];
        newlist.map((item) => {
            let {code} = item;
            if ((code.endsWith('0000') && sequence.substr(0, 2) === code.substr(0, 2)) ||
                ((code.endsWith('00') && sequence.substr(0, 4) === code.substr(0, 4))) ||
                (sequence === code)) {
                newusercoupon.push(item)
            }
        });

        return <div className="profile-page">

            {address.map((item, index) => {

                let {id, def, name} = item;

                let actions = [<Button onClick={() => {

                    this.edit(item)
                }}><Icon type="edit" key="setting"/>修改</Button>];

                if (def === 2) {
                    actions.push(<Button onClick={() => {
                        this.def(id)
                    }}><Icon type="setting" key="setting"/>设为默认</Button>);
                } else {
                    actions.push(<Button type="danger">默认地址</Button>)
                }

                actions.push(
                    <Button onClick={() => {
                        this.remove(id, index)
                    }}><Icon type="delete" key="setting"/>删除</Button>);

                let checked = addrIndex === index;

                return <Card
                    key={index}
                    title="收货地址"
                    hoverable={true}
                    style={{width: 350, float: "left"}}
                    actions={actions}>
                    <div style={checked ? {border: '1px dashed green'} : {}} onClick={() => {
                        this.setState({addrIndex: index})
                    }}>
                        <div> 收货人：{name}</div>
                        <div> 手机号：{item.mobile}</div>
                        <div> 地址：{Utils.addr.getPCD(item.code)}</div>
                        <div> 街道：{item.detail}</div>
                    </div>
                </Card>
            })}

            <Card
                title="添加新地址"
                hoverable={true}
                style={{width: 350, height: 248, float: "left"}}
                actions={[]}>
                <div>
                    <Tag color='red' onClick={() => {
                        this.edit({id: 0})
                    }}>
                        <Icon type="edit"/>
                        <span>添加新地址......</span>
                    </Tag>
                </div>
            </Card>

            <div className='clearfix'/>

            <Table
                pagination={false}
                columns={[

                    {
                        title: '序号',
                        dataIndex: 'id',
                        className: 'txt-center',
                        render: (col, row, i) => {
                            return <span>{(i + 1)}</span>
                        },
                    },

                    {
                        title: '商品展示',
                        dataIndex: '',
                        className: 'txt-center',
                        render: (item) => this.renderImg(item)
                    },

                    {
                        title: '商品名称',
                        dataIndex: '',
                        className: 'txt-center',
                        render: (item) => {
                            let {product = []} = item;
                            let {title} = product;
                            return <Tag color='red'>
                                {title}
                            </Tag>
                        }
                    },

                    {
                        title: '商品规格',
                        dataIndex: '',
                        className: 'txt-center',
                        render: (item) => {
                            let {sno, product = {}} = item;
                            let {productItems = []} = product;
                            let str = '';
                            productItems.map((v) => {
                                if (sno === v.sno) {
                                    let {params = []} = v;
                                    params.map((v) => {
                                        str += v.value;
                                    })
                                }
                            });
                            return <Tag color='blue'>
                                {str}
                            </Tag>
                        }
                    },


                    {
                        title: '商品价格￥',
                        dataIndex: '',
                        className: 'txt-center',
                        render: (item) => {
                            let {product = []} = item;
                            let {productItems = []} = product;
                            return <div>{
                                productItems.map((v) => {
                                    let {sno, price} = v;
                                    return <div>
                                        {sno === item.sno && <Tag color='cyan'>{price}￥</Tag>}
                                    </div>
                                })
                            }
                            </div>
                        }
                    },
                    {
                        title: '商品数量',
                        dataIndex: 'num',
                        className: 'txt-center',
                        render: (num) => {
                            return <Tag color='green'>{num}</Tag>
                        }
                    },

                    {
                        title: '小计￥',
                        dataIndex: '',
                        className: 'txt-center',
                        render: (item) => {
                            let {num, product = {}} = item;
                            let {productItems = []} = product;
                            return <div>{
                                productItems.map((v) => {
                                    let {sno, price} = v;
                                    if (sno === item.sno) {
                                        let total = parseInt(num * price);

                                        return <Tag color='purple'>{total}￥</Tag>
                                    }
                                })}
                            </div>
                        }
                    },
                ]}
                rowKey={(record) => record.id}
                dataSource={products}/>

            <div>
                <span>可用优惠券：</span>
            </div>

            <div className='coupon'>
                {newusercoupon.map((item, index) => {
                    let usercoupon = usercoupons.find(a => a.couponId === item.id);
                    let {getAt, expirAt, status} = usercoupon;
                    let {price, rule = {}, code,} = item;
                    let {values = []} = rule;
                    let tip = '';
                    let now = new Date().getTime();
                    if (rule.type === 1) {
                        tip = '满' + values[0] + '减' + values[1];
                    }
                    if (rule.type === 2) {
                        tip = '每' + values[0] + '减' + values[1];
                    }
                    if (rule.type === 3) {
                        tip = '直减' + values[0];
                    }
                    let ret = '';
                    let {sorts = []} = this.state;
                    sorts.map((s) => {
                        let {name} = s;
                        if (code === s.sequence) {
                            ret = '仅可购买' + name + '可用';
                        }
                    });
                    if (code === "000000") {
                        ret = '全品通用';
                    }
                    let checked = userCouponId === index;
                    return <div key={index} className="coupon-item" style={checked ? {border: '1px dashed green'} : {}}
                                onClick={() => {
                                    this.setState({userCouponId: index, coupon: item});
                                    this.count(item);

                                }}>

                        <div className="c-type">

                            <div className="c-price">
                                <em>￥</em>
                                <strong>{price}</strong>
                                <span className="user-type">剑券</span>
                            </div>
                            <div className='c-limit'>
                                <span>{tip}</span>
                            </div>
                            <div className="c-time">
                                &nbsp;&nbsp;
                            </div>
                            <div className="c-time">
                                {U.date.format(new Date(getAt), 'yyyy-MM-dd')}
                                --
                                {U.date.format(new Date(expirAt), 'yyyy-MM-dd')}
                            </div>
                            <div className="c-type-top">

                            </div>
                            <div className="c-type-bottom">

                            </div>
                        </div>
                        <div className="c-msg">
                            <div className="c-range">
                                <div className="range-item">
                                    <span className="label">限品类：</span>
                                    <span className="user-txt">{ret}</span>
                                </div>
                                <div className="range-item">
                                    <span className="label">限平台：</span>
                                    <span className="user-txt">全平台</span>
                                </div>
                            </div>
                        </div>
                        {(status === 3) ? <div className='overdue-site used'/> : <div
                            className={(expirAt - now < 0) ? 'overdue-site overdue-yet' : ((expirAt - now < 86400000) ? 'overdue-site' : '')}/>}
                    </div>
                })}
            </div>

            <div className='count'>
                <Button className='but' type="dashed">共{totalNum}件商品</Button>
                <Button className='but' type="dashed">总金额：{oldTotal}￥</Button>
                <Button className='but' type="dashed">优惠券抵扣：-{price}￥</Button>
                <Button className='but' type="dashed">运费：12￥</Button>
                <Button className='but' type="dashed">应付总额：{newTotal}￥</Button>
                <Button className='but' type="danger" onClick={this.order}>提交订单</Button>
            </div>
            <div className='clearfix-h20'/>
        </div>
    }
}