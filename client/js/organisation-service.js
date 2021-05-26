import {BaseService} from '../js/base-service.js';
export class OrganisationService extends BaseService {
    getOrganisationDetail() {
        return this.GET(this.erpGet.ERPOrganisationSetting);
    }
    saveOrganisationSetting(data) {
     return this.POST(this.ERPObjects.TCompanyInfo, data);
     }

     getCompLogo() {
         return this.GET(this.ERPObjects.TcompLogo);
     }

     getCompLogoData() {
       let options = {
           PropertyList: "Id,MIMEEncodedPicture,ImageName",
       };
         return this.getList(this.ERPObjects.TcompLogo, options);
     }

     getCompanyInfo(){
         let options = {
             PropertyList: "PoBox,PoBox2,PoBox3,PoCity,PoState,PoPostcode,PoCountry,abn,CompanyName,TradingName,PhoneNumber,Address,Address2,Address3,Url,Email",
         };
         return this.getList(this.ERPObjects.TCompanyInfo, options);
     }

     getEmployeeProfileImageByName(employeeName) {
         let options = {
             
             PropertyList: "ID,EncodedPic,EmployeeName",
             
         };
         return this.getList(this.ERPObjects.TemployeePicture, options);
     }

}
