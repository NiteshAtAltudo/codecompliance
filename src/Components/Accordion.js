import 'bootstrap/dist/css/bootstrap.min.css';
import GetDataFromAzureDevOps from './AzureDevOps'

const Accordion = () => {
    return (
        <div className="accordion" id="accordionExample">
            <GetDataFromAzureDevOps
            props={{ parentProject:"Project A",organisationName:"kumarsumit0856",
            projectName:"HeadlessTraining",repositoryId:"a3cfb678-4093-46ab-a7d0-48e3fea86fb3",
            tokenAccessInBase64:"OnN2eWZrNHRhendrZ2xva3VtbWEyaGtlNmNha2Frdjd0YXB6Nm1wNTNocXd3eHRtNXB5c3E=",
            defaultAccordianItem:"item1"}}
            />
            <GetDataFromAzureDevOps props={{parentProject:"Project B", organisationName:"nitesh727",
            projectName:"Dashboard",repositoryId:"a00dfb0c-b63b-443a-a473-c6f10c3d1b93",
            tokenAccessInBase64:"OjRueWFmZGxxdWxubHBqaHR0ZWxsN2VyaXdyd2M3bWVhNmcycnpqNHk3b21wamlnY2NrdWE=",}}
            />
            <GetDataFromAzureDevOps
            props={{parentProject:"Project C", organisationName:"kumarsumit0856",
            projectName:"HeadlessTraining",repositoryId:"a3cfb678-4093-46ab-a7d0-48e3fea86fb3",
            tokenAccessInBase64:"OnN2eWZrNHRhendrZ2xva3VtbWEyaGtlNmNha2Frdjd0YXB6Nm1wNTNocXd3eHRtNXB5c3E="}}
            />
            <GetDataFromAzureDevOps
            props={{parentProject:"Project D", organisationName:"kumarsumit0856",
            projectName:"HeadlessTraining",repositoryId:"a3cfb678-4093-46ab-a7d0-48e3fea86fb3",
            tokenAccessInBase64:"OnN2eWZrNHRhendrZ2xva3VtbWEyaGtlNmNha2Frdjd0YXB6Nm1wNTNocXd3eHRtNXB5c3E="}}
            />
        </div>
    );
};


export default Accordion;

