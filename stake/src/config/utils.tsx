import {Toast, Loading, SpinLoading} from 'antd-mobile';

export  class LoadingUtils {
  instance: unknown;

  show() {
    this.instance = Toast.show({
      content: <div>
        <SpinLoading color='primary' />
      </div>  ,
      maskClickable: false,
      duration: 0,
    });
  }
  hide() {
    this.instance?.close();
  }
}

export const loading= new LoadingUtils();