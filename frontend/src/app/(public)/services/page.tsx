import OurServices from "@/components/services/ourServices"
import Services from "@/components/services/serviceList"
import ReadyToSurprise from "@/components/services/ready"
import ChooseType from "@/components/services/chooseType"
export default function services (){
    return <div>

        <OurServices></OurServices>
        <ChooseType></ChooseType>
        <Services></Services>
        <ReadyToSurprise></ReadyToSurprise>
        
    </div>
}