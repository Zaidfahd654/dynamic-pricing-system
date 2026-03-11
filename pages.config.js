import Home from "./Home.jsx"
import PriceHistory from "./PriceHistory.jsx"
import DemandForecast from "./DemandForecast.jsx"
import DynamicPricing from "./DynamicPricing.jsx"
import DataAnalysis from "./DataAnalysis.jsx"
import UploadSalesData from "./UploadSalesData.jsx"
import __Layout from "./Layout.jsx"

export const PAGES = {
  Home: Home,
  PriceHistory: PriceHistory,
  DemandForecast: DemandForecast,
  DynamicPricing: DynamicPricing,
  DataAnalysis: DataAnalysis,
  UploadSalesData: UploadSalesData,
}

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
}
