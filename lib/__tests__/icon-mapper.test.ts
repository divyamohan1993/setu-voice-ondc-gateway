/**
 * Unit tests for icon-mapper utility
 */

import { describe, it, expect } from '@jest/globals';
import {
  getCommodityIcon,
  getLogisticsLogo,
  getBuyerLogo,
  extractCommodityName,
  getCommodityIconFromProduct,
  COMMODITY_ICON_MAP,
  LOGISTICS_LOGO_MAP,
  BUYER_LOGO_MAP,
  DEFAULT_COMMODITY_ICON,
  DEFAULT_LOGISTICS_LOGO,
  DEFAULT_BUYER_LOGO,
} from '../icon-mapper';

describe('Icon Mapper Utility', () => {
  describe('getCommodityIcon', () => {
    it('should return correct icon for onion variants', () => {
      expect(getCommodityIcon('onion')).toBe('/icons/onion.png');
      expect(getCommodityIcon('onions')).toBe('/icons/onion.png');
      expect(getCommodityIcon('pyaaz')).toBe('/icons/onion.png');
      expect(getCommodityIcon('pyaz')).toBe('/icons/onion.png');
    });

    it('should return correct icon for mango variants', () => {
      expect(getCommodityIcon('mango')).toBe('/icons/mango.png');
      expect(getCommodityIcon('mangoes')).toBe('/icons/mango.png');
      expect(getCommodityIcon('aam')).toBe('/icons/mango.png');
      expect(getCommodityIcon('alphonso')).toBe('/icons/mango.png');
    });

    it('should return correct icon for tomato variants', () => {
      expect(getCommodityIcon('tomato')).toBe('/icons/tomato.png');
      expect(getCommodityIcon('tomatoes')).toBe('/icons/tomato.png');
      expect(getCommodityIcon('tamatar')).toBe('/icons/tomato.png');
    });

    it('should return correct icon for potato variants', () => {
      expect(getCommodityIcon('potato')).toBe('/icons/potato.png');
      expect(getCommodityIcon('potatoes')).toBe('/icons/potato.png');
      expect(getCommodityIcon('aloo')).toBe('/icons/potato.png');
    });

    it('should return correct icon for wheat variants', () => {
      expect(getCommodityIcon('wheat')).toBe('/icons/wheat.png');
      expect(getCommodityIcon('gehun')).toBe('/icons/wheat.png');
      expect(getCommodityIcon('gehu')).toBe('/icons/wheat.png');
    });

    it('should handle case-insensitive input', () => {
      expect(getCommodityIcon('ONION')).toBe('/icons/onion.png');
      expect(getCommodityIcon('Mango')).toBe('/icons/mango.png');
      expect(getCommodityIcon('PYAAZ')).toBe('/icons/onion.png');
    });

    it('should handle whitespace in input', () => {
      expect(getCommodityIcon('  onion  ')).toBe('/icons/onion.png');
      expect(getCommodityIcon(' mango ')).toBe('/icons/mango.png');
    });

    it('should return default icon for unknown commodity', () => {
      expect(getCommodityIcon('unknown')).toBe(DEFAULT_COMMODITY_ICON);
      expect(getCommodityIcon('banana')).toBe(DEFAULT_COMMODITY_ICON);
      expect(getCommodityIcon('')).toBe(DEFAULT_COMMODITY_ICON);
    });
  });

  describe('getLogisticsLogo', () => {
    it('should return correct logo for India Post variants', () => {
      expect(getLogisticsLogo('india post')).toBe('/logos/india-post.png');
      expect(getLogisticsLogo('india-post')).toBe('/logos/india-post.png');
      expect(getLogisticsLogo('indiapost')).toBe('/logos/india-post.png');
    });

    it('should return correct logo for Delhivery', () => {
      expect(getLogisticsLogo('delhivery')).toBe('/logos/delhivery.png');
    });

    it('should return correct logo for BlueDart variants', () => {
      expect(getLogisticsLogo('bluedart')).toBe('/logos/bluedart.png');
      expect(getLogisticsLogo('blue dart')).toBe('/logos/bluedart.png');
      expect(getLogisticsLogo('blue-dart')).toBe('/logos/bluedart.png');
    });

    it('should handle case-insensitive input', () => {
      expect(getLogisticsLogo('INDIA POST')).toBe('/logos/india-post.png');
      expect(getLogisticsLogo('Delhivery')).toBe('/logos/delhivery.png');
      expect(getLogisticsLogo('BLUEDART')).toBe('/logos/bluedart.png');
    });

    it('should return default logo for unknown provider', () => {
      expect(getLogisticsLogo('unknown')).toBe(DEFAULT_LOGISTICS_LOGO);
      expect(getLogisticsLogo('fedex')).toBe(DEFAULT_LOGISTICS_LOGO);
    });
  });

  describe('getBuyerLogo', () => {
    it('should return correct logo for Reliance variants', () => {
      expect(getBuyerLogo('reliance')).toBe('/logos/reliance.png');
      expect(getBuyerLogo('reliance fresh')).toBe('/logos/reliance.png');
      expect(getBuyerLogo('reliance-fresh')).toBe('/logos/reliance.png');
    });

    it('should return correct logo for BigBasket variants', () => {
      expect(getBuyerLogo('bigbasket')).toBe('/logos/bigbasket.png');
      expect(getBuyerLogo('big basket')).toBe('/logos/bigbasket.png');
      expect(getBuyerLogo('big-basket')).toBe('/logos/bigbasket.png');
    });

    it('should return correct logo for Paytm variants', () => {
      expect(getBuyerLogo('paytm')).toBe('/logos/paytm.png');
      expect(getBuyerLogo('paytm mall')).toBe('/logos/paytm.png');
      expect(getBuyerLogo('paytm-mall')).toBe('/logos/paytm.png');
    });

    it('should return correct logo for Flipkart variants', () => {
      expect(getBuyerLogo('flipkart')).toBe('/logos/flipkart.png');
      expect(getBuyerLogo('flipkart grocery')).toBe('/logos/flipkart.png');
      expect(getBuyerLogo('flipkart-grocery')).toBe('/logos/flipkart.png');
    });

    it('should handle case-insensitive input', () => {
      expect(getBuyerLogo('RELIANCE')).toBe('/logos/reliance.png');
      expect(getBuyerLogo('BigBasket')).toBe('/logos/bigbasket.png');
      expect(getBuyerLogo('PAYTM MALL')).toBe('/logos/paytm.png');
    });

    it('should return default logo for unknown buyer', () => {
      expect(getBuyerLogo('unknown')).toBe(DEFAULT_BUYER_LOGO);
      expect(getBuyerLogo('amazon')).toBe(DEFAULT_BUYER_LOGO);
    });
  });

  describe('extractCommodityName', () => {
    it('should extract commodity from product name', () => {
      expect(extractCommodityName('Nasik Onions')).toBe('onions');
      expect(extractCommodityName('Fresh Alphonso Mango')).toBe('alphonso');
      expect(extractCommodityName('Organic Tomatoes')).toBe('tomatoes');
      expect(extractCommodityName('Premium Wheat')).toBe('wheat');
    });

    it('should handle Hindi/Hinglish names', () => {
      expect(extractCommodityName('Nasik Pyaaz')).toBe('pyaaz');
      expect(extractCommodityName('Fresh Aam')).toBe('aam');
      expect(extractCommodityName('Organic Tamatar')).toBe('tamatar');
      expect(extractCommodityName('Premium Gehun')).toBe('gehun');
    });

    it('should return original name if no commodity found', () => {
      expect(extractCommodityName('Unknown Product')).toBe('Unknown Product');
      expect(extractCommodityName('Banana')).toBe('Banana');
    });

    it('should handle case-insensitive matching', () => {
      expect(extractCommodityName('NASIK ONIONS')).toBe('onions');
      expect(extractCommodityName('fresh MANGO')).toBe('mango');
    });
  });

  describe('getCommodityIconFromProduct', () => {
    it('should return correct icon from product name', () => {
      expect(getCommodityIconFromProduct('Nasik Onions')).toBe('/icons/onion.png');
      expect(getCommodityIconFromProduct('Fresh Alphonso Mango')).toBe('/icons/mango.png');
      expect(getCommodityIconFromProduct('Organic Tomatoes')).toBe('/icons/tomato.png');
      expect(getCommodityIconFromProduct('Premium Wheat')).toBe('/icons/wheat.png');
    });

    it('should handle Hindi/Hinglish product names', () => {
      expect(getCommodityIconFromProduct('Nasik Pyaaz')).toBe('/icons/onion.png');
      expect(getCommodityIconFromProduct('Fresh Aam')).toBe('/icons/mango.png');
      expect(getCommodityIconFromProduct('Organic Tamatar')).toBe('/icons/tomato.png');
    });

    it('should return default icon for unknown products', () => {
      expect(getCommodityIconFromProduct('Unknown Product')).toBe(DEFAULT_COMMODITY_ICON);
      expect(getCommodityIconFromProduct('Banana')).toBe(DEFAULT_COMMODITY_ICON);
    });
  });

  describe('Constants', () => {
    it('should have all required commodity icons', () => {
      expect(COMMODITY_ICON_MAP).toHaveProperty('onion');
      expect(COMMODITY_ICON_MAP).toHaveProperty('mango');
      expect(COMMODITY_ICON_MAP).toHaveProperty('tomato');
      expect(COMMODITY_ICON_MAP).toHaveProperty('potato');
      expect(COMMODITY_ICON_MAP).toHaveProperty('wheat');
    });

    it('should have all required logistics logos', () => {
      expect(LOGISTICS_LOGO_MAP).toHaveProperty('india post');
      expect(LOGISTICS_LOGO_MAP).toHaveProperty('delhivery');
      expect(LOGISTICS_LOGO_MAP).toHaveProperty('bluedart');
    });

    it('should have all required buyer logos', () => {
      expect(BUYER_LOGO_MAP).toHaveProperty('reliance');
      expect(BUYER_LOGO_MAP).toHaveProperty('bigbasket');
      expect(BUYER_LOGO_MAP).toHaveProperty('paytm');
      expect(BUYER_LOGO_MAP).toHaveProperty('flipkart');
    });

    it('should have valid default values', () => {
      expect(DEFAULT_COMMODITY_ICON).toBe('/icons/wheat.png');
      expect(DEFAULT_LOGISTICS_LOGO).toBe('/logos/india-post.png');
      expect(DEFAULT_BUYER_LOGO).toBe('/logos/reliance.png');
    });
  });
});
