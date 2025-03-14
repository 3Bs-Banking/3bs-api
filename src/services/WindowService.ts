import BaseService from "@/core/BaseService";
import { Window } from "@/models/Window";
import { Service } from "typedi";

@Service()
export class WindowService extends BaseService<Window> {
  constructor() {
    super(Window);
  }
}
