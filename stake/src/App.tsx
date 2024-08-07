import {useState, useRef, useEffect} from 'react'
import  Web3 from 'web3'
import {Form, Button, Toast, Space, Input, Radio, Dialog, Modal } from 'antd-mobile';
import {ABI, CONTRACT_ADDRESS, loading} from './config';
import './App.less'

function App() {
  const [amount, setAmount] = useState('')
  const [visible, setVisible] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('')
  const [available, setAvailable] = useState(0)
  const [trend, setTrend] = useState('')
  const contract = useRef()
  const web3 = useRef()
  const account = useRef('')

  const [form] = Form.useForm()

  const initContract = () => {
    if (contract.current) {
      return contract.current;
    }
    try {
      contract.current = new web3.current.eth.Contract(ABI, CONTRACT_ADDRESS);
      contract.current.events.TokensPurchased({
        filter:{},
        fromBlock: 'latest'
      })
        .on('data', function(event){
          queryBalance();
          console.log('TokensPurchased-success', event); // same results as the optional callback above
        })
      contract.current.events.TokensExchanged({
        filter:{},
        fromBlock: 'latest'
      })
        .on('data', function(event){
          console.log('TokensExchanged-success', event); // same results as the optional callback above
        })
      contract.current.events.GuessResolved({
        filter:{},
        fromBlock: 'latest'
      })
        .on('data', function(event){
          console.log('GuessResolved-success', event); // same results as the optional callback above
        })
    } catch (e) {
      console.log('initContract error', e);
    }
  };

  const getWeb3Instance = async () => {
    if (web3.current) {
      return web3.current;
    }
    let web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      ethereum.on('accountsChanged', function (accounts: string[]) {
        console.log('accountsChanged', accounts);
        account.current = accounts[0];
      });
      ethereum.on('connect', (connectInfo: never) => {
        Toast.show('wallet connect success');
        console.log(connectInfo);
      });
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        account.current = accounts[0];
      } catch (e) {
        console.log(' user denied authorization', e)
      }
      web3.current = new Web3(web3Provider);

      initContract();
    } else {
      Dialog.alert({
        content: 'Please use Google Chrome and install the MetaMask wallet plugin',
      });
      Promise.reject('not support')
    }
  }

  const callStake = async (amount: number, trend: boolean) => {
    if (!account.current) {
      await getWeb3Instance();
    }
    const amountToStake = web3.current.utils.toWei(amount, 'ether');
    await contract.current.methods.approve(CONTRACT_ADDRESS, amountToStake).send({ from: account.current });
    const res = await contract.current.methods
      .stake(amountToStake, trend)
      .call();
    console.log('res--', res);
  }

  const onFinish = async () => {
    loading.show();
    try {
      if(!account.current) {
        await getWeb3Instance();
      }
      console.log('xxxx')
      if (!available) {
        showPurchaseTokens();
        return;
      }
      const values = form.getFieldsValue();
      await callStake(values.amount, values.trend === 'Rise');
    } catch (e) {
       loading.hide();
     }
  }
  const showPurchaseTokens = () => {
    setVisible(true)
  }
  const purchaseTokens = async () => {
    if (!account.current) {
      await getWeb3Instance();
    }
    const res = await contract.current.methods
      .purchaseTokens()
      .send({from: account.current, value: web3.current.utils.toWei(chargeAmount, 'ether')});
    console.log('res---', res);
    Toast.show({
      icon: 'success',
      content: 'Purchase tokens success',
    })
  }

  const queryBalance = async () => {
    if (!account.current) {
      await getWeb3Instance();
    }
    try {
      const balance = await contract.current.methods
        .balanceOf(account.current)
        .call();
      setAvailable(web3.current.utils.fromWei(balance, 'ether'));
      // console.log("User balance:", web3.current.utils.fromWei(balance, 'ether'));
    } catch (e) {
      console.log('callContract error', e);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      getWeb3Instance().then(()=> {
        queryBalance();
      });
    } else {
      Dialog.alert({
        content: '请使用谷歌浏览器，并安装MetaMask钱包插件',
      });
    }
  }, []);
  return (
    <main className="container">
      <div className="row">
        <span className="row-label">Balance</span>
        <span className="row-value">Available: ${available} <Button fill='none' size="small" style={{color: '#1677ff'}} onClick={showPurchaseTokens}>兑换</Button></span>
      </div>
      <div className="row">
        <span className="row-label">Place Bet</span>
      </div>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          amount: amount,
          trend: trend,
        }}
        footer={
          <Button block color='primary' type='submit' size='large'>
            提交
          </Button>
        }
      >
        <Form.Item
          name='amount'
          label='Amount'
          rules={[{ required: true, message: 'Amount cannot be empty' }]}
          required
        >
          <Input type='number' placeholder='Enter Amount' />
        </Form.Item>
        <Form.Item
          name='trend'
          label='Trend'
          required
          rules={[{ required: true, message: 'Trend cannot be empty' }]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value='Rise'>Rise</Radio>
              <Radio value='Fall'>Fall</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
      <div className="row">
        <span className="row-label">Bet Result</span>
      </div>

      <div className="row">
        <span className="label">BTC Price after 10 seconds:</span>
        <span className="value">Rise</span>
      </div>
      <div className="row">
        <span className="label">Your Guess:</span>
        <span className="value">Fall</span>
      </div>
      <div className="row">
        <span className="label">Result:</span>
        <span className="value">Lose</span>
      </div>
      <div className="row">
        <span className="row-label">Bet History</span>
      </div>
      <div className="bet-history">
        <div className="bet-item">
          <span className="bet-item-time">Date</span>
          <span>Amount</span>
          <span>Result</span>
        </div>
        <div className="bet-item">
          <span className="bet-item-time">2024-08-01 16:46:10</span>
          <span>$1000</span>
          <span className="win">Win</span>
        </div>
        <div className="bet-item">
          <span className="bet-item-time">2024-08-01 16:46:10</span>
          <span>$1000</span>
          <span className="lose">Lose</span>
        </div>
        <div className="bet-item">
          <span className="bet-item-time">2024-08-01 16:46:10</span>
          <span>$1000</span>
          <span className="lose">Lose</span>
        </div>
        <div className="bet-item">
          <span className="bet-item-time">2024-08-01 16:46:10</span>
          <span>$1000</span>
          <span className="lose">Lose</span>
        </div>
        <div className="bet-item">
          <span className="bet-item-time">2024-08-01 16:46:10</span>
          <span>$1000</span>
          <span className="lose">Lose</span>
        </div>
      </div>
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        closeOnAction
        content={<Input placeholder="Enter exchange ether" value={chargeAmount} onChange={setChargeAmount} />}
        actions={[
          {
            key: 'confirm',
            text: 'confirm',
            async onClick() {
              if (chargeAmount) {
                await purchaseTokens();
              } else {
                return Promise.reject()
              }
            }
          },
          {
            key: 'cancel',
            text: 'cancel',
            style:{
              color: '#666666'
            }
          },
        ]}
      >
      </Modal>
    </main>
  )
}

export default App
