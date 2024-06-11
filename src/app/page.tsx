"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = {
  devices: number;
  messagesPerSecond: number;
  objects: number;
  activeSecondsPerMinute: number;
  hoursInPeriod: number;
  memory: number;
};

const defaultState: State = {
  devices: 100,
  messagesPerSecond: 0,
  objects: 1,
  activeSecondsPerMinute: 0,
  hoursInPeriod: 1,
  memory: 128,
};

const calculateCost = (state: State) => {
  const {
    devices,
    messagesPerSecond,
    hoursInPeriod,
    objects,
    activeSecondsPerMinute,
    memory,
  } = state;

  const initialRequests = devices * objects;

  // 1時間あたりのリクエスト数
  const totalMessages = messagesPerSecond * devices * 3600 * hoursInPeriod;

  // WebSocketのリクエスト数は20:1の割合で計算
  const webSocketRequests = totalMessages / 20;

  // 合計リクエスト数の計算
  const totalRequests = initialRequests + webSocketRequests;

  // 課金対象のリクエスト数の計算
  const billableRequests = Math.max(0, totalRequests - 1_000_000);

  // リクエストコストの計算 100万リクエストで0.15ドル
  const onRequestsCost = 0.15 / 1_000_000;
  const requestsCost = billableRequests * onRequestsCost;

  // 持続時間コストの計算
  const totalSeconds = objects * activeSecondsPerMinute * 60 * hoursInPeriod;

  // メモリコストの計算
  const totalGBs = totalSeconds * (memory / 1024);

  // 課金対象のGB数の計算
  const billableGBs = Math.max(0, totalGBs - 400_000);

  // 1GB秒あたりのコストは0.0125ドル
  const oneGBSecondCost = 12.5 / 1_000_000;

  // 持続時間コストの計算
  const durationCost = billableGBs * oneGBSecondCost;

  const totalCost = requestsCost + durationCost + 5;

  return {
    totalCost,
    requestsCost,
    durationCost,
  };
};

export default function Home() {
  const [state, setState] = useState<State>(defaultState);
  const [error, setError] = useState<string | null>(null);

  const [dollYen, setDollYen] = useState<number>(150);

  const onChange =
    (key: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (Number.isNaN(value)) {
        setError("数値を入力してください");
      } else {
        setError(null);
      }

      setState({ ...state, [key]: value });
    };

  const { totalCost, requestsCost, durationCost } = calculateCost(state);

  const totalYen = totalCost * dollYen;

  return (
    <div className="container mx-auto p-10">
      <div className="flex flex-wrap gap-6">
        <div>
          <Label htmlFor="devices">端末の数</Label>
          <Input
            className="max-w-md"
            id="devices"
            onChange={onChange("devices")}
            type="number"
            value={state.devices}
          />
        </div>
        <div>
          <Label htmlFor="messagesPerSecond">メッセージ数/秒</Label>
          <Input
            className="max-w-md"
            id="messagesPerSecond"
            onChange={onChange("messagesPerSecond")}
            type="number"
            value={state.messagesPerSecond}
          />
        </div>
        <div>
          <Label htmlFor="objects">Durable Objectsの数</Label>
          <Input
            className="max-w-md"
            id="objects"
            onChange={onChange("objects")}
            type="number"
            value={state.objects}
          />
        </div>
        <div>
          <Label htmlFor="activeSecondsPerMinute">
            1分あたりのアクティブな秒数
          </Label>
          <Input
            className="max-w-md"
            id="activeSecondsPerMinute"
            onChange={onChange("activeSecondsPerMinute")}
            type="number"
            value={state.activeSecondsPerMinute}
          />
        </div>
        <div>
          <Label htmlFor="hoursInPeriod">期間（時間）</Label>
          <Input
            className="max-w-md"
            id="hoursInPeriod"
            onChange={onChange("hoursInPeriod")}
            type="number"
            value={state.hoursInPeriod}
          />
        </div>

        <div>
          <Label htmlFor="memory">メモリ（MB）</Label>
          <Input
            className="max-w-md"
            id="memory"
            onChange={onChange("memory")}
            type="number"
            value={state.memory}
          />
        </div>

        <div>
          <Label htmlFor="dollYen">ドル/円</Label>
          <Input
            className="max-w-md"
            id="dollYen"
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (Number.isNaN(value)) {
                setError("数値を入力してください");
                setDollYen(0);

                return;
              }
              setError(null);

              setDollYen(value);
            }}
            type="number"
            value={dollYen}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="mt-10 text-2xl font-bold">リクエストコスト</h2>

        <div className="mt-5 flex flex-col gap-5">
          {/* リクエストコスト */}
          <div className="flex">
            <div className="w-40">リクエストコスト: </div>
            <div className="font-bold">${requestsCost.toFixed(2)}</div>
          </div>

          {/* 持続時間コスト */}
          <div className="flex">
            <div className="w-40">持続時間コスト: </div>
            <div className="font-bold">${durationCost.toFixed(2)}</div>
          </div>

          {/* Worker有料プラン */}
          <div className="flex">
            <div className="w-40">Worker有料プラン</div>
            <div className="font-bold">${5}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-2xl">
          <p>
            合計コスト(ドル)
            <span className="ml-6 font-bold">${totalCost.toFixed(2)}</span>
          </p>
          <p>
            合計コスト(円)
            <span className="ml-6 font-bold">{totalYen.toFixed(2)}円</span>
          </p>
        </div>

        {error && <p className="mt-6 text-red-500">{error}</p>}
      </div>
    </div>
  );
}
