import BaseService from "@/core/BaseService";
import { Appointment, ReservationType } from "@/models/Appointment";
import Redis from "ioredis";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";

const GRACE_PERIOD = 5 * 60 * 1000;
const EARLY_LIMIT = 15 * 60 * 1000;
const AGING_BONUS_MULTIPLIER = 1.5;
const MAX_AGING_BONUS = 50;
const FORCE_SERVE_AFTER_MIN = 40;

@Service()
export class AppointmentService extends BaseService<Appointment> {
  private redis: Redis;

  constructor() {
    super(Appointment);
    this.redis = new Redis(process.env.REDIS_URL);
  }

  private getQueueKey(branchId: string) {
    return `queue:${branchId}`;
  }

  private getTokenKey(tokenId: string) {
    return `token:${tokenId}`;
  }

  override async create(data: DeepPartial<Appointment>): Promise<Appointment> {
    const token = await super.create(data);
    if (token.reservationType === ReservationType.OFFLINE)
      await this.addToken(token, this.calculatePriority(token));
    return token;
  }

  async addToken(token: Appointment, priority: number) {
    const queueKey = this.getQueueKey(token.branch.id);
    const tokenKey = this.getTokenKey(token.id);

    await this.redis.set(tokenKey, JSON.stringify(token));
    await this.redis.zadd(queueKey, priority, token.id);
  }

  async removeToken(tokenId: string, branchId: string) {
    const queueKey = this.getQueueKey(branchId);
    const tokenKey = this.getTokenKey(tokenId);

    await this.redis.zrem(queueKey, tokenId);
    await this.redis.del(tokenKey);
    console.log("removed token:", tokenId);
  }

  async getNextToken(branchId: string): Promise<Appointment | null> {
    const queueKey = this.getQueueKey(branchId);
    const ids = await this.redis.zrange(queueKey, 0, 0);

    if (ids.length === 0) return null;

    console.log("ids:", ids);

    const tokenId = this.getTokenKey(ids[0]);
    const tokenData = await this.redis.get(tokenId);
    console.log("tokenData:", tokenData);
    await this.removeToken(ids[0], branchId);
    return tokenData ? JSON.parse(tokenData) : null;
  }

  async getQueue(branchId: string): Promise<Appointment[]> {
    const queueKey = this.getQueueKey(branchId);
    const ids = await this.redis.zrange(queueKey, 0, -1);
    const tokens: Appointment[] = [];

    for (const id of ids) {
      const data = await this.redis.get(this.getTokenKey(id));
      if (data) tokens.push(JSON.parse(data));
    }

    return tokens;
  }

  async updateTokenPriority(
    tokenId: string,
    branchId: string,
    newScore: number
  ) {
    const queueKey = this.getQueueKey(branchId);
    await this.redis.zadd(queueKey, newScore, tokenId);
  }

  async updateAllTokens(branchId: string) {
    const tokens = await this.getQueue(branchId);
    const prorities = tokens.map((token) => this.calculatePriority(token));

    for (let i = 0; i < tokens.length; i++)
      await this.updateTokenPriority(tokens[i].id, branchId, prorities[i]);
  }

  public calculatePriority(token: Appointment): number {
    if (token.appointmentArrivalTimestamp === null) return 0;

    const now = new Date().getTime();
    let baseScore = 0;

    if (token.reservationType === ReservationType.ONLINE) {
      const diff = token.appointmentScheduledTimestamp
        ? new Date(token.appointmentScheduledTimestamp).getTime() - now
        : 0;

      if (Math.abs(diff) <= GRACE_PERIOD) baseScore = 100;
      else if (diff > 0 && diff <= EARLY_LIMIT) baseScore = 9;
      else if (diff > EARLY_LIMIT) baseScore = 60;
      else baseScore = 50;
    } else {
      baseScore = 60;
    }

    const waitingTimeInMins =
      (now - new Date(token.appointmentArrivalTimestamp).getTime()) / 60000;
    const agingBonus = Math.min(
      waitingTimeInMins * AGING_BONUS_MULTIPLIER,
      MAX_AGING_BONUS
    );
    if (waitingTimeInMins > FORCE_SERVE_AFTER_MIN) baseScore = 999;

    return baseScore + agingBonus;
  }
}
