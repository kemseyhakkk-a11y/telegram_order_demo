<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# is there a. poosbile way to use telegram as a delivery app

Yes — Telegram can work as a delivery app, especially for **ordering, tracking, notifications, and customer chat**. Businesses use Telegram bots or Telegram Mini Apps to show menus, take orders, collect delivery details, send status updates, and even accept payments in some setups.[^1_1][^1_2][^1_3]

## How it can work

A typical setup is:

- Customers open a Telegram bot or mini app.
- They browse a menu/catalog.
- They place an order and enter delivery address and notes.
- The bot sends the order to staff or a dashboard.
- Staff update status like confirmed, preparing, out for delivery, delivered.[^1_4][^1_2][^1_1]


## What Telegram can handle

Telegram supports delivery-related features such as:

- Bot menus and order forms.[^1_2][^1_1]
- Customer notifications and order updates.[^1_1][^1_4]
- Location sharing for delivery coordination.[^1_5][^1_1]
- Payments through the Bot Payments API, including shipping options for physical goods.[^1_3]


## Best use cases

Telegram is a good fit if you want:

- A low-cost ordering channel.
- A lightweight system for restaurants or local delivery.
- Fast communication between customers, dispatchers, and drivers.
- A custom workflow connected to your POS or backend.[^1_6][^1_4][^1_2]


## Limits to consider

Telegram is not a full delivery platform by itself unless you build the workflow around it. You may still need:

- A database or admin dashboard.
- Driver assignment logic.
- Payment handling.
- Order management and delivery status tools.[^1_7][^1_4][^1_3]

For your kind of restaurant/POS work, Telegram is especially practical as the **front end** for customers, while your backend handles orders, drivers, inventory, and reporting.[^1_2][^1_3]
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.callbell.eu/en/telegram-for-delivery/index.html

[^1_2]: https://dev.family/blog/article/product-launch-on-messenger-apps-telegram-web-app-opportunities-for-businesses

[^1_3]: https://core.telegram.org/bots/payments

[^1_4]: https://help.delivapp.com/en/support/solutions/articles/66000506360-setting-up-telegram-to-create-and-manage-orders

[^1_5]: https://www.callbell.eu/es/telegram-para-el-delivery/

[^1_6]: https://github.com/daveeth/beu_telebot

[^1_7]: https://core.telegram.org

[^1_8]: https://blog.follow.it/new-delivery-channel-telegram/

[^1_9]: https://www.callbell.eu/en/telegram-for-delivery/

[^1_10]: https://wnauts.com/project/application-in-the-telegram-chat-bot-for-parcel-delivery/

[^1_11]: https://www.egrow.com/en/integrations/telegram_bot/asapDelivery

[^1_12]: https://miniappsbuilder.com

[^1_13]: https://www.linkedin.com/posts/pomegstar_automation-contentstrategy-telegrambots-activity-7389300269508919296-NB38

[^1_14]: https://www.reddit.com/r/ecommerce/comments/p0a3be/will_this_be_useful_a_telegram_application_for/


---

# let see a client open the mini app and save order, the bot repy with the receipt, and admin click prepare the bot replt to customer with a message " your order has been prapare" and then the admin click on the bot tell the customer " your menu has deliver" with the driver contact and real time live location.

is this possible?

Yes, this is **possible** with Telegram, and the flow you described maps well to a bot + Mini App + admin panel setup. Telegram Mini Apps can handle the customer ordering UI, bots can send receipts and status messages, and Telegram supports live location sharing for delivery tracking workflows.[^2_1][^2_2][^2_3][^2_4]

## Customer flow

The customer can open your Mini App inside Telegram, choose items, submit the order, and your backend can save it to your database immediately after checkout or confirmation. After the order is saved, the bot can send a receipt message to the same customer chat, and Telegram’s payments flow also supports sending receipt and delivery information when payment is involved.[^2_5][^2_3][^2_6][^2_1]

## Admin flow

Your admin can receive the order in a staff bot or dashboard, then press buttons like “Prepare” and “Delivered” to trigger automated messages back to the customer. This works because Telegram bots can send normal text replies, inline buttons, and workflow-driven status updates once your backend receives the admin action through a webhook or bot callback.[^2_6][^2_5]

## Delivery tracking

Sending the driver’s contact is straightforward as a normal bot message with name and phone details stored in your system. Live location is also possible, but the cleanest version is usually that the driver shares a Telegram live location in chat, or your system sends/upgrades location messages using Telegram’s live geolocation features for a limited period such as 15 minutes, 1 hour, or 8 hours.[^2_2][^2_7][^2_4][^2_6]

## Important limits

The one part to design carefully is **real-time driver tracking**, because Telegram is not a full Uber-style tracking platform by itself. If you want continuous map updates from a driver app in the background, you usually need either the driver to manually share Telegram live location or a separate driver web/mobile app that pushes coordinates to your backend, then your bot sends updates or a tracking link to the customer.[^2_8][^2_9][^2_2]

## Recommended architecture

A practical setup is:

- Mini App for customer menu and checkout[^2_1]
- Bot for receipts, order status, and customer chat[^2_3][^2_6]
- Admin panel or staff bot with buttons: Confirm, Prepare, Dispatch, Delivered[^2_6]
- Database/backend for orders, status, drivers, and message automation[^2_5]
- Optional driver workflow for contact + live location sharing[^2_4][^2_2]

For your exact example, the message sequence can be:

1. Customer places order in Mini App, order saved in DB[^2_1]
2. Bot sends receipt to customer[^2_3]
3. Admin clicks “Prepare,” bot sends “Your order has been prepared”[^2_6]
4. Admin clicks “Delivered” or “Out for delivery,” bot sends driver contact and live tracking info[^2_2][^2_4]

Yes, this is realistic to build. The main question is whether you want the driver side to be simple Telegram-only, or a more advanced GPS-tracked delivery system.
<span style="display:none">[^2_10][^2_11][^2_12][^2_13][^2_14][^2_15]</span>

<div align="center">⁂</div>

[^2_1]: https://core.telegram.org/bots/webapps

[^2_2]: https://core.telegram.org/api/live-location

[^2_3]: https://core.telegram.org/bots/payments

[^2_4]: https://telegram.org/blog/live-locations

[^2_5]: https://aunimeda.com/blog/telegram-mini-app-with-payments-tutorial

[^2_6]: https://masamenu.tr/en/docs/telegram/

[^2_7]: https://stackoverflow.com/questions/45125250/how-can-send-the-telegram-bot-location-to-users

[^2_8]: https://stackoverflow.com/questions/78771928/telegram-bot-geolocation

[^2_9]: https://github.com/samirsaci/telegram_transport

[^2_10]: https://aglamov.biz/marketing/telegram/integracija-mini-apps-v-boty-telegram-poshagovoe-rukovodstvo-dlja-nachinajushhih

[^2_11]: https://www.youtube.com/watch?v=kaK_OsuhrSQ

[^2_12]: https://core.telegram.org/api/payments

[^2_13]: https://stackoverflow.com/questions/48238445/how-can-i-get-live-location-in-telegram-bot-via-python

[^2_14]: https://docs.botmother.com/article/56176

[^2_15]: https://github.com/openclaw/openclaw/issues/30394


---

# i want to to do the delivery in telegram only

Yes — you can do a **Telegram-only** delivery workflow, but it will be a simpler version of a delivery app, not a full Grab/Foodpanda-style system. Telegram can handle ordering, receipt messages, admin status buttons, driver contact sharing, customer address/location capture, and driver live location sharing inside Telegram chats.[^3_1][^3_2][^3_3][^3_4]

## What works in Telegram only

You can keep the whole flow inside Telegram like this:

- Customer opens Mini App and places order.[^3_4]
- Bot saves the order and sends a receipt in chat.[^3_5][^3_4]
- Admin clicks “Prepare” and the bot sends “Your order has been prepared”.[^3_2]
- Admin clicks “Out for delivery” or “Delivered” and the bot sends driver name, phone, and tracking instructions.[^3_3][^3_1]

This part is fully realistic with no separate customer app needed.[^3_2][^3_4]

## Driver location

The driver can share live location directly in Telegram chat, and Telegram supports live geolocation sharing for timed sessions such as 15 minutes, 1 hour, or 8 hours. That means the customer can watch the driver move on the Telegram map without leaving Telegram, as long as the driver is sharing live location in the relevant chat.[^3_6][^3_7][^3_3]

## Important limitation

The main limitation is that a bot cannot use an inline button to force a user or driver to send location; location requests must use a regular reply keyboard, not inline keyboard buttons. So your flow should be designed like: bot sends “Share your location” or “Driver, share live location now,” then the user/driver taps a Telegram keyboard button or manually uses Telegram’s attach menu to send or share location.[^3_8][^3_9][^3_10][^3_11][^3_1][^3_6]

## Best Telegram-only setup

A clean Telegram-only setup would be:

- Customer chat with bot for ordering and status[^3_4][^3_2]
- Staff/admin private bot or staff group for action buttons like Accept, Prepare, Dispatch, Delivered[^3_2]
- Driver chat or delivery group where the driver sends live location[^3_6][^3_3]
- Bot forwards key delivery info back to the customer, including driver contact and status messages[^3_1][^3_2]


## Practical recommendation

For Telegram-only delivery, the most workable version is: Mini App for menu, bot for receipt and statuses, and manual driver live location sharing in Telegram when the order is dispatched. That gives you a usable restaurant delivery system entirely inside Telegram, with the tradeoff that live tracking depends on the driver actively sharing their location rather than a background GPS app.[^3_9][^3_3][^3_4]

Yes, it is possible. The best mental model is “Telegram ordering + Telegram dispatch + Telegram live location,” not “fully automated courier tracking platform”.[^3_3][^3_4]
<span style="display:none">[^3_12][^3_13][^3_14][^3_15][^3_16][^3_17][^3_18]</span>

<div align="center">⁂</div>

[^3_1]: https://core.telegram.org/api/bots/buttons

[^3_2]: https://core.telegram.org/bots/features

[^3_3]: https://core.telegram.org/api/live-location

[^3_4]: https://core.telegram.org/bots/webapps

[^3_5]: https://core.telegram.org/bots/payments

[^3_6]: https://puc-telegram.com/blogs/777/

[^3_7]: https://telegram.org/blog/live-locations

[^3_8]: https://stackoverflow.com/questions/68021560/how-i-can-request-the-users-location-in-inline-keyboard-within-telegram

[^3_9]: https://stackoverflow.com/questions/66464964/is-it-possible-to-use-telegram-bot-inline-button-to-get-user-live-location

[^3_10]: https://github.com/irazasyed/telegram-bot-sdk/issues/882

[^3_11]: https://stackoverflow.com/questions/50658232/how-to-request-users-live-location-using-telegram-bot-api/50717325

[^3_12]: https://n8n.io/workflows/7664-telegram-bot-inline-keyboard-with-dynamic-menus-and-rating-system/

[^3_13]: https://github.com/openclaw/openclaw/issues/10264

[^3_14]: https://docs.python-telegram-bot.org/en/v21.9/telegram.inlinekeyboardbutton.html

[^3_15]: https://docs.python-telegram-bot.org/en/v13.0/telegram.inlinequeryresultlocation.html

[^3_16]: https://hfeu-telegram.com/news/how-to-enable-telegram-live-location-1905/

[^3_17]: https://community.latenode.com/t/how-can-i-implement-contact-and-location-request-buttons-in-a-telegram-bot/17910

[^3_18]: https://telegram-bot-sdk.com/docs/guides/keyboards/


---

# let see i hava. a group of delivery man,

when the bot send order to the group
one member will select this order to get delivery
when select. the admin staff know which delievery is man click and his live location during the delievery

Yes — this workflow is possible in Telegram-only, and it fits group-based dispatch very well. A bot can post an order into a delivery group, drivers can tap an inline button like “Take Order,” and the bot receives a callback query that identifies which Telegram user claimed the order.[^4_1][^4_2][^4_3]

## How the claim works

When the bot posts the order in the delivery group, attach inline buttons such as:

- Take order
- Cancel claim
- Delivered

When a delivery man taps “Take order,” Telegram sends a callback query to your bot instead of posting a normal chat message, so your backend can instantly save the selected driver’s Telegram user ID, name, and claimed order record. After that, the bot can edit the original group message to show “Claimed by Dara” so other drivers do not take the same job.[^4_4][^4_2][^4_3][^4_1]

## How admin knows who took it

The bot can notify admin staff in a private admin group or admin chat as soon as the claim happens, because the callback query includes the user who clicked the button. That means admin can see exactly which delivery man accepted the order, along with the order ID, claim time, and contact details stored in your system.[^4_2][^4_3][^4_4]

## Live location part

The delivery man can share live location in Telegram, and Telegram supports live location sharing inside groups and chats with an interactive map. So the practical Telegram-only flow is: after claiming the order, the bot asks that driver to share live location in a driver group or direct chat, and admin can monitor that live location inside Telegram while the delivery is in progress.[^4_5][^4_6]

## Important setup rules

For group workflows, privacy settings matter because Telegram bots have group privacy mode enabled by default, which limits what group messages the bot can see. In practice, you should disable privacy mode and make the bot an admin in the delivery group so it can reliably process replies, button flows, and group activity tied to delivery operations.[^4_7][^4_8][^4_9][^4_10][^4_11]

## Best design for your case

The best Telegram-only structure is:

- Customer bot + Mini App for ordering[^4_12]
- Delivery group where the bot posts new jobs[^4_1]
- Inline button “Take order” for drivers[^4_3]
- Admin group or admin bot where staff see who claimed the job[^4_2]
- Driver shares live location in Telegram after claiming[^4_6][^4_5]

One important limit: the bot can know **who clicked the claim button** automatically, but for **live location** the driver still needs to actively share it in Telegram; the bot cannot silently track background GPS like a dedicated courier app.[^4_5][^4_7][^4_6]

So yes, your idea works:

1. Bot sends order to delivery group[^4_1]
2. One delivery man taps “Take order”[^4_3]
3. Bot saves which driver claimed it and informs admin[^4_2]
4. Driver shares live location in Telegram[^4_6]
5. Admin watches delivery progress in Telegram only[^4_5]

The cleanest version is to give each claimed order its own bot-guided flow: claim, confirm, share live location, delivered.
<span style="display:none">[^4_13][^4_14][^4_15][^4_16]</span>

<div align="center">⁂</div>

[^4_1]: https://core.telegram.org/api/bots/buttons

[^4_2]: https://docs.python-telegram-bot.org/en/v13.2/telegram.callbackquery.html

[^4_3]: https://core.telegram.org/bots/2-0-intro

[^4_4]: https://docs.python-telegram-bot.org/en/v22.1/telegram.inlinekeyboardbutton.html

[^4_5]: https://telegramlite.com/articles/how-to-share-your-live-location-to-let-contacts-or-group-members-for-telegram

[^4_6]: https://telegram.org/blog/live-locations

[^4_7]: https://hermesagent.org.cn/en/docs/user-guide/messaging/telegram

[^4_8]: https://hermes-agent.lzw.me/docs/en/user-guide/messaging/telegram

[^4_9]: https://chatimize.com/telegram-bot-group/

[^4_10]: https://docs.deva.me/guides/telegram-groups

[^4_11]: https://core.telegram.org/method/bots.setBotGroupDefaultAdminRights

[^4_12]: https://core.telegram.org/bots/webapps

[^4_13]: https://github.com/eternnoir/pyTelegramBotAPI/issues/563

[^4_14]: https://community.n8n.io/t/telegram-bot-handling-inline-button-callbacks-reset-command-across-workflows/96816

[^4_15]: https://stackoverflow.com/questions/58276742/telegram-bot-execute-callback-on-click-of-inline-query-result

[^4_16]: https://community.latenode.com/t/handling-inline-keyboard-button-presses-in-a-python-telegram-bot/13875


---

# when the delivery share the location, can the bot take this message and send it to customer who order it the see the delivery progress?

Yes — but the bot should usually **capture the driver’s live location updates and send its own live-location message to the customer**, instead of simply forwarding the original driver message. Telegram supports receiving live location updates, and those updates arrive as edits to the original location message, which a bot can track and use to update another live-location message in the customer chat.[^5_1][^5_2][^5_3][^5_4]

## Best way

The strongest design is:

1. Driver claims the order.
2. Bot asks the driver to share live location to the bot or a driver chat.
3. Bot stores that incoming live-location message.
4. Bot sends a live-location message to the customer chat.
5. As the driver location changes, the bot updates the customer’s live-location message with the new coordinates.[^5_2][^5_3][^5_1]

This gives the customer a clean tracking message tied to their own order, instead of forwarding group noise or relying on the customer to watch a driver group.[^5_3][^5_4]

## Why not simple forward

A plain forward may not be the best solution because live location is a special message type that updates over time, and bot workflows are more reliable when the bot receives the coordinates and then manages the customer-facing message itself. Telegram’s live location system explicitly supports sending a live location and then editing that same message as coordinates change until the live period ends.[^5_5][^5_4][^5_1][^5_2][^5_3]

## What the bot can know

When the driver shares live location with the bot, your backend can read latitude and longitude from the location message, and later updates can be captured from edited messages while live sharing is active. That means the bot can always know the latest position of the assigned driver for that order and mirror it to the customer chat in near real time.[^5_6][^5_7][^5_2][^5_5]

## Important requirement

For this to work well, the driver should share the live location in a place your bot can read, such as a direct chat with the bot or a group where the bot has the needed access. If the driver only shares location in some chat the bot cannot access, the bot cannot relay that tracking data to the customer.[^5_8][^5_9][^5_10]

## Practical Telegram-only flow

A practical flow would be:

- Bot posts order in delivery group, driver taps “Take order”[^5_11][^5_12]
- Bot opens a private driver flow: “Please share live location for Order \#123”[^5_8]
- Driver sends live location to the bot[^5_7][^5_13]
- Bot sends “Driver is on the way” plus a live location to the customer[^5_4][^5_3]
- Bot keeps updating the customer message until delivery is complete or location sharing ends[^5_1][^5_2][^5_5]

So yes, this is possible, and technically the clean answer is: **don’t just forward the driver’s message — mirror it through the bot to the customer**.[^5_3][^5_1]
<span style="display:none">[^5_14][^5_15][^5_16][^5_17][^5_18][^5_19]</span>

<div align="center">⁂</div>

[^5_1]: https://core.telegram.org/api/live-location

[^5_2]: https://stackoverflow.com/questions/48238445/how-can-i-get-live-location-in-telegram-bot-via-python

[^5_3]: https://gramio.dev/telegram/methods/sendlocation

[^5_4]: https://josxa.stoplight.io/docs/bot-api/b3A6NDE0NjQ3Ng-create-a-edit-message-live-location

[^5_5]: https://golubevcg.com/post/real-time_location_sharing_with_telegram_bots

[^5_6]: https://community.latenode.com/t/how-to-receive-continuous-location-updates-from-telegram-bot-users-with-python/25224

[^5_7]: https://docs.botmother.com/article/56176

[^5_8]: https://community.latenode.com/t/retrieving-users-location-in-a-python-telegram-bot/14762

[^5_9]: https://hermesagent.org.cn/en/docs/user-guide/messaging/telegram

[^5_10]: https://docs.deva.me/guides/telegram-groups

[^5_11]: https://core.telegram.org/api/bots/buttons

[^5_12]: https://docs.python-telegram-bot.org/en/v13.2/telegram.callbackquery.html

[^5_13]: https://telegram.org/blog/live-locations

[^5_14]: https://botize.com/en/formula/637/forward-to-another-chat-the-messages-written-by-a-specific-user-in-a-telegram-group

[^5_15]: https://community.latenode.com/t/how-to-create-a-telegram-bot-that-forwards-messages-to-another-chat/23987

[^5_16]: https://dev.to/linuxmaster/telegram-forwarder-automate-message-forwarding-between-telegram-chats-using-python-telethon-3ajh

[^5_17]: https://github.com/openclaw/openclaw/issues/30394

[^5_18]: https://stackoverflow.com/questions/51791599/forward-incoming-messages-from-telegram-to-another-chat

[^5_19]: https://github.com/Voltorane/telegram-location-sharing-bot


---

# now summarize it step by step from customer order to delivery done

Yes — here is the full Telegram-only flow step by step.

## 1) Customer places order

The customer opens the Telegram Mini App or bot menu, chooses items, adds notes, and submits the order. The bot saves the order in your system and sends the customer a receipt message with the order number and summary.

## 2) Bot posts order to delivery group

The bot sends the new order into the delivery group with order details and a button like “Take Order.” All delivery staff can see it.

## 3) One driver claims the order

A delivery man taps “Take Order.” The bot records exactly which Telegram user clicked it, so you know who accepted the job. The bot can also edit the group message to show the order is already claimed.

## 4) Admin sees the assigned driver

Your admin staff receives a notification or checks the order dashboard/group message and sees the driver name, Telegram account, and assigned order. So admin knows who is delivering before the driver leaves.

## 5) Driver shares live location

The bot asks the assigned driver to share live location in Telegram. The driver sends live location, and the bot reads those updates while delivery is active.

## 6) Bot sends tracking to customer

The bot mirrors the driver’s live location to the customer chat, so the customer can see delivery progress without leaving Telegram. If the driver location changes, the bot updates the customer tracking message.

## 7) Delivery status updates

When the driver is on the way, the bot can send a message like “Your order is on the way.” When the driver is near the destination, it can send another update such as “Arriving soon.”

## 8) Delivery completed

After the driver reaches the customer and hands over the order, the driver or admin marks it as delivered. The bot then sends the customer a final message like “Your order has been delivered,” and the live tracking stops.

## Simple flow summary

Customer orders → bot saves order → bot sends order to delivery group → driver claims it → admin sees who claimed it → driver shares live location → bot shows progress to customer → driver delivers → bot marks order done.

If you want, I can turn this into a clean Telegram workflow diagram next.

---

# make a paste ready for ai to build

Use this prompt as-is for an AI builder or developer assistant:

## Build prompt

Create a Telegram-only food delivery system using **Telegram Mini App + Telegram Bot + delivery group**, with no separate mobile app for customers or drivers. Telegram Mini Apps can handle the ordering UI and can send data back to the bot, while bots can work with callback buttons, customer messages, and live-location updates.[^7_1][^7_2][^7_3]

### Goal

Build a full order-to-delivery workflow that runs entirely inside Telegram:

- Customer orders inside Telegram.
- Bot saves the order.
- Bot sends receipt to customer.
- Bot posts the order into a delivery group.
- One delivery driver claims the order.
- Admin/staff can see which driver claimed it.
- Driver shares live location in Telegram only.
- Bot mirrors that live location to the customer.
- Admin can update status until delivery is complete.[^7_4][^7_5][^7_6][^7_1]


### Main actors

- Customer
- Telegram Bot
- Telegram Mini App
- Admin/Staff
- Delivery group
- Delivery driver[^7_3][^7_1]


### Required flow

1. Customer opens the Telegram Mini App from the bot and browses menu items.
2. Customer adds products, quantity, address, phone, and note, then submits the order.
3. Mini App sends the order data to backend/bot and saves it in the database.
4. Bot sends the customer a receipt message with order ID, items, total, payment method, address, and current status.
5. Bot posts a formatted order message into a private delivery group.
6. The delivery-group message must include inline buttons such as:
    - Take Order
    - Cancel Claim
    - Mark Delivered
7. When a driver clicks “Take Order,” use Telegram callback query handling to capture the exact Telegram user who claimed the order.
8. Save the assigned driver info to the order record, including Telegram user ID, display name, username, claim time, and status.
9. Edit the original delivery-group message to show that the order has been claimed and by whom, so no other driver can take it.
10. Notify admin/staff that the driver has claimed the order.
11. Bot sends a private message to the assigned driver asking them to share live location in Telegram.
12. Driver shares live location to the bot or to a chat the bot can access.
13. Bot receives the live-location message and tracks updates while the live period is active.
14. Bot sends a customer-facing live-location message to the customer chat.
15. As the driver location changes, the bot updates the customer’s live-location message using Telegram live-location editing methods.
16. Bot sends status updates such as:

- Order confirmed
- Preparing
- Driver assigned
- Out for delivery
- Arriving soon
- Delivered

17. When admin or driver marks the order delivered, stop live location updates and send the customer a final delivered message.[^7_7][^7_8][^7_5][^7_6][^7_1][^7_4]

### Important Telegram rules

- Use Telegram Mini App for customer ordering UI.[^7_9][^7_1]
- Use inline keyboard buttons for actions like “Take Order,” because these produce callback queries the bot can process.[^7_5][^7_7]
- Do not try to request location from inline keyboard buttons; Telegram does not support `request_location` in inline keyboard buttons, so use reply keyboards or ask the driver to manually share live location in chat.[^7_10][^7_11]
- The bot must have access to the chat where the driver sends live location, otherwise it cannot read the location updates.[^7_12][^7_13]
- For delivery-group workflows, configure the bot so it can properly work in groups and process message/button events needed for dispatch.[^7_14][^7_15]
- Live location should be mirrored by the bot to the customer, not simply forwarded, so the bot can control the customer-facing tracking session and update it cleanly.[^7_6][^7_16][^7_17]


### Features to implement

- Customer Mini App menu and checkout
- Order database
- Receipt generation in bot chat
- Delivery group dispatch message
- Driver claim with callback query
- Admin notification when claimed
- Driver assignment tracking
- Driver live location intake
- Customer live tracking message
- Delivery status management
- Delivered completion flow.[^7_1][^7_3][^7_7][^7_6]


### Suggested data model

Create at least these entities:

- users
- customers
- drivers
- orders
- order_items
- order_status_logs
- driver_locations
- telegram_chats

Each order should store:

- order_id
- customer_telegram_id
- customer_chat_id
- assigned_driver_telegram_id
- assigned_driver_chat_id
- delivery_group_message_id
- customer_tracking_message_id
- status
- total
- delivery_address
- phone
- note
- created_at
- claimed_at
- delivered_at

Each driver location record should store:

- order_id
- driver_telegram_id
- latitude
- longitude
- heading if available
- horizontal_accuracy if available
- updated_at.[^7_18]


### Bot behavior

Implement these bot actions:

- `/start`
- open mini app
- send receipt
- post order to delivery group
- handle callback query for Take Order
- notify admin when claimed
- ask driver for live location
- receive and process live location updates
- send or edit customer live-location message
- mark preparing
- mark out for delivery
- mark delivered
- stop live location when complete.[^7_4][^7_7][^7_1]


### UX details

- Customer should only see their own order updates.
- Only one driver can claim an order.
- If already claimed, block other drivers from taking it.
- Show assigned driver name in admin/staff view.
- Send customer the driver contact once assigned.
- Show clear order statuses in both staff and customer flows.
- Keep the whole experience inside Telegram, with no external customer app.[^7_3][^7_5][^7_6]


### Tech requirements

Use a backend that supports Telegram webhooks and database persistence. The implementation must support tracking Telegram callback queries, Telegram Mini App submissions, and live-location updates on messages that continue changing during the delivery period.[^7_2][^7_7][^7_6]

### Deliverable

Build production-ready backend logic, Telegram bot handlers, Mini App integration, database schema, and a clear status workflow for:
customer order → receipt → delivery group dispatch → driver claim → admin notified → driver shares live location → customer tracks driver → delivered.[^7_5][^7_6][^7_1]

## Shorter version

If you want a shorter copy-paste version, use this:

Build a Telegram-only food delivery system using Telegram Mini App + Telegram Bot + delivery group. Customer orders in Mini App, bot saves order and sends receipt, bot posts order to delivery group, one driver clicks inline button “Take Order,” bot captures callback query and assigns that driver, admin sees assigned driver, bot asks driver to share live location in Telegram, bot receives live-location updates, bot sends and updates a live-location message in customer chat, and admin/driver can mark status as preparing, out for delivery, and delivered. Do not use inline keyboard for location request because Telegram does not support request_location in inline buttons; ask driver to share live location in chat instead. Store order IDs, Telegram user IDs, message IDs, driver assignment, and customer tracking message ID so the bot can edit the tracking message during delivery.[^7_11][^7_7][^7_6][^7_1][^7_4][^7_5]

Would you like me to turn this into a more technical spec for Cursor/OpenCode with database schema and webhook routes?
<span style="display:none">[^7_19][^7_20][^7_21][^7_22][^7_23]</span>

<div align="center">⁂</div>

[^7_1]: https://core.telegram.org/bots/webapps

[^7_2]: https://core.telegram.org/bots/api

[^7_3]: https://core.telegram.org/bots/features

[^7_4]: https://grammy.dev/ref/core/api

[^7_5]: https://core.telegram.org/api/bots/buttons

[^7_6]: https://core.telegram.org/api/live-location

[^7_7]: https://docs.python-telegram-bot.org/en/v13.2/telegram.callbackquery.html

[^7_8]: https://hexdocs.pm/telega/telega/api.html

[^7_9]: https://core.telegram.org/api/bots/webapps

[^7_10]: https://stackoverflow.com/questions/50658232/how-to-request-users-live-location-using-telegram-bot-api/50717325

[^7_11]: https://stackoverflow.com/questions/68021560/how-i-can-request-the-users-location-in-inline-keyboard-within-telegram

[^7_12]: https://hermesagent.org.cn/en/docs/user-guide/messaging/telegram

[^7_13]: https://docs.deva.me/guides/telegram-groups

[^7_14]: https://chatimize.com/telegram-bot-group/

[^7_15]: https://core.telegram.org/method/bots.setBotGroupDefaultAdminRights

[^7_16]: https://gramio.dev/telegram/methods/sendlocation

[^7_17]: https://josxa.stoplight.io/docs/bot-api/b3A6NDE0NjQ3Ng-create-a-edit-message-live-location

[^7_18]: https://docs.python-telegram-bot.org/en/v21.9/telegram.location.html

[^7_19]: https://pub.dev/documentation/telegram_web_app/latest/telegram_web_app/TelegramWebApp-class.html

[^7_20]: https://github.com/telegram-mini-apps-dev/awesome-telegram-mini-apps

[^7_21]: https://telegrambots.github.io/book/4/webapps.html

[^7_22]: https://www.scribd.com/document/375985681/Telegram-Bot-API-docx

[^7_23]: https://dev.to/simplr_sh/telegram-mini-apps-creation-handbook-58em

