import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutButtons } from "./checkout-buttons";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

describe("CheckoutButtons", () => {
  it("starts only a Creem checkout", async () => {
    mockFetch.mockResolvedValue({
      status: 502,
      ok: false,
      json: async () => ({ message: "test stop" })
    });
    render(<CheckoutButtons planId="credits_100" cta="Buy 100 credits with Creem" available />);

    fireEvent.click(screen.getByRole("button", { name: "Buy 100 credits with Creem" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/billing/checkout",
        expect.objectContaining({
          body: JSON.stringify({ planId: "credits_100", provider: "creem" })
        })
      );
    });
  });
});

it("网络未知后只读核对，重复点击只发一次",async()=>{let reject!:(e:Error)=>void;mockFetch.mockImplementation(()=>new Promise((_,r)=>{reject=r}));render(<CheckoutButtons planId="credits_100" cta="购买" available />);const button=screen.getByRole("button",{name:"购买"});fireEvent.click(button);fireEvent.click(button);expect(mockFetch).toHaveBeenCalledTimes(1);reject(new Error("network"));await waitFor(()=>expect(button).toBeEnabled());expect(screen.getByRole("alert")).toHaveTextContent("requires manual review");});

it("未登录完整回到本地化当前页",async()=>{window.history.replaceState({},"","/zh-CN/pricing?source=menu#credits");mockFetch.mockResolvedValue({status:401});const go=vi.fn();render(<CheckoutButtons planId="credits_100" cta="购买" locale="zh-CN" available navigate={go}/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));await waitFor(()=>expect(go).toHaveBeenCalledWith("/login?next=%2Fzh-CN%2Fpricing%3Fsource%3Dmenu%23credits"));});
it("JSON失败后只读恢复已有安全URL",async()=>{mockFetch.mockResolvedValueOnce({status:200,ok:true,json:async()=>{throw new Error("bad_json")}}).mockResolvedValue({status:200,ok:true,json:async()=>({checkoutUrl:"https://www.creem.io/payment/test"})});const go=vi.fn();render(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));await waitFor(()=>expect(screen.getByRole("alert")).toBeVisible());fireEvent.click(screen.getByRole("button",{name:"Check payment status"}));await waitFor(()=>expect(go).toHaveBeenCalledOnce());expect(mockFetch).toHaveBeenCalledTimes(2);expect(mockFetch.mock.calls[1][0]).toBe("/api/billing/status?attempt_id=current");expect(mockFetch.mock.calls[1][1].method).toBeUndefined();});
it("卸载后晚响应不导航",async()=>{let resolve!:(r:unknown)=>void;mockFetch.mockImplementation(()=>new Promise(r=>resolve=r));const go=vi.fn();const view=render(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));view.unmount();await act(async()=>resolve({ok:true,status:200,json:async()=>({checkoutUrl:"https://www.creem.io/payment/test"})}));expect(go).not.toHaveBeenCalled();});
it("任意供应商返回地址不导航",async()=>{mockFetch.mockResolvedValue({ok:true,status:200,json:async()=>({checkoutUrl:"https://evil.example"})});const go=vi.fn();render(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));await waitFor(()=>expect(screen.getByRole("alert")).toBeVisible());expect(go).not.toHaveBeenCalled();});
it("成功开始导航后保持忙状态防止重复创建checkout",async()=>{mockFetch.mockResolvedValue({ok:true,status:200,json:async()=>({checkoutUrl:"https://www.creem.io/payment/test"})});const go=vi.fn();render(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));await waitFor(()=>expect(go).toHaveBeenCalledOnce());expect(screen.getByRole("button")).toBeDisabled();});
it("超时结束忙状态并允许重试",async()=>{vi.useFakeTimers();try{mockFetch.mockImplementation((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener("abort",()=>reject(new Error("abort")))));render(<CheckoutButtons planId="credits_100" cta="购买" available/>);fireEvent.click(screen.getByRole("button",{name:"购买"}));await act(async()=>vi.advanceTimersByTimeAsync(15001));expect(screen.getByRole("alert")).toBeVisible();expect(screen.getByRole("button")).toBeEnabled();}finally{vi.useRealTimers();}});

it("available变化即时禁用且旧响应不清除新忙状态或导航",async()=>{
 const resolvers:((r:unknown)=>void)[]=[];mockFetch.mockImplementation(()=>new Promise(r=>resolvers.push(r)));const go=vi.fn();
 const view=render(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);fireEvent.click(screen.getByRole("button"));
 view.rerender(<CheckoutButtons planId="credits_100" cta="购买" available={false} navigate={go}/>);expect(screen.getByRole("button")).toBeDisabled();fireEvent.click(screen.getByRole("button"));expect(mockFetch).toHaveBeenCalledOnce();
 view.rerender(<CheckoutButtons planId="credits_100" cta="购买" available navigate={go}/>);expect(screen.getByRole("button")).toBeEnabled();fireEvent.click(screen.getByRole("button"));expect(mockFetch).toHaveBeenCalledTimes(2);
 await act(async()=>resolvers[0]({ok:true,status:200,json:async()=>({checkoutUrl:"https://www.creem.io/payment/old"})}));expect(go).not.toHaveBeenCalled();expect(screen.getByRole("button")).toBeDisabled();
 await act(async()=>resolvers[1]({ok:true,status:200,json:async()=>({checkoutUrl:"https://www.creem.io/payment/new"})}));expect(go).toHaveBeenCalledWith("https://www.creem.io/payment/new");
});
it("未知状态持续只读刷新，completed后才允许主动新购",async()=>{
 mockFetch.mockResolvedValueOnce({ok:true,status:202,json:async()=>({attempt:{id:"one",status:"unknown"}})}).mockResolvedValueOnce({ok:true,status:200,json:async()=>({attempt:{id:"one",status:"completed"}})}).mockResolvedValueOnce({ok:true,status:200,json:async()=>({attempt:{id:"two",status:"ready",checkoutUrl:"https://www.creem.io/payment/new"}})});
 const go=vi.fn();render(<CheckoutButtons planId="credits_100" cta="购买" locale="zh-CN" available navigate={go}/>);fireEvent.click(screen.getByRole("button"));await waitFor(()=>expect(screen.getByRole("button")).toHaveTextContent("刷新付款状态"));
 fireEvent.click(screen.getByRole("button"));await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("服务端确认"));expect(go).not.toHaveBeenCalled();expect(mockFetch.mock.calls[1][0]).toBe("/api/billing/status?attempt_id=current");
 fireEvent.click(screen.getByRole("button"));await waitFor(()=>expect(go).toHaveBeenCalledOnce());expect(mockFetch.mock.calls[2][1].method).toBe("POST");
});
