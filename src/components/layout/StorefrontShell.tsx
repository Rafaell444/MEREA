"use client";
import Header, { type HeaderMenu } from "./Header";
import MenuDrawer, { type MenusMap } from "./MenuDrawer";
import SearchDrawer from "./SearchDrawer";
import MiniCart from "@/components/cart/MiniCart";
import NotifyDrawer from "@/components/product/NotifyDrawer";
import SizeGuideDrawer from "@/components/product/SizeGuideDrawer";
import PopupManager from "@/components/popups/PopupManager";
import type { MenuNode } from "@/lib/cms/defaults";
import type { PopupConfig, SizeGuide } from "@/lib/cms/content";

type Props = {
  menus: MenusMap;
  service: MenuNode[];
  popups: PopupConfig[];
  sizeGuides: SizeGuide[];
  logo?: string;
  transparentOnHome: boolean;
  freeShippingFrom: number;
};

/** Client shell: header + every drawer/popup. Data comes from the server layout. */
export default function StorefrontShell({ menus, service, popups, sizeGuides, logo, transparentOnHome, freeShippingFrom }: Props) {
  const headerMenus: HeaderMenu[] = Object.entries(menus).map(([key, m]) => ({ key, label: m.label }));
  return (
    <>
      <Header menus={headerMenus} logo={logo} transparentOnHome={transparentOnHome} />
      <MenuDrawer menus={menus} service={service} />
      <SearchDrawer />
      <MiniCart freeShippingFrom={freeShippingFrom} />
      <NotifyDrawer />
      <SizeGuideDrawer guides={sizeGuides} />
      <PopupManager popups={popups} />
    </>
  );
}
